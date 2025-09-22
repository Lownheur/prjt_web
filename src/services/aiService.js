const OPENROUTER_API_KEY = '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'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'deepseek/deepseek-chat-v3.1:free'

export class AIService {
  static async generateQuestions(quizzData, options = {}) {
    const {
      title,
      description,
      existingQuestions = [],
      additionalContext = '',
      questionCount = 3
    } = options

    // Construire le prompt
    const prompt = this.buildPrompt(title, description, existingQuestions, additionalContext, questionCount)

    try {
      console.log(`Génération avec Llama 3.2 3B`)
      console.log('Modèle utilisé:', MODEL)
      console.log('API Key présente:', !!OPENROUTER_API_KEY)
      
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Quizzmaster'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant expert en création de questions de quiz éducatives. Tu dois répondre uniquement avec du JSON valide, sans texte supplémentaire.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error?.message || response.statusText
        
        console.error('Erreur API complète:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        if (response.status === 429) {
          throw new Error('Le modèle est temporairement surchargé. Réessayez dans quelques minutes.')
        } else if (response.status === 401) {
          throw new Error(`Erreur d'authentification (401). Détails: ${errorMsg}`)
        } else if (response.status === 404) {
          throw new Error(`Modèle non trouvé (404): ${MODEL}. Vérifiez que le modèle existe sur OpenRouter.`)
        } else {
          throw new Error(`Erreur API (${response.status}): ${errorMsg}`)
        }
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('Réponse vide de l\'IA')
      }

      // Parser la réponse JSON
      const questions = this.parseAIResponse(content)
      console.log('Questions générées avec succès par Llama 3.2 3B')
      return { success: true, questions, usedModel: 'Llama 3.2 3B' }

    } catch (error) {
      console.error('Erreur génération IA:', error)
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la génération des questions'
      }
    }
  }

  static buildPrompt(title, description, existingQuestions, additionalContext, questionCount) {
    let prompt = `Génère ${questionCount} questions de quiz sur le thème "${title}"`
    
    if (description) {
      prompt += ` avec la description suivante: "${description}"`
    }

    if (additionalContext) {
      prompt += `\n\nContexte supplémentaire: ${additionalContext}`
    }

    if (existingQuestions.length > 0) {
      prompt += `\n\nQuestions déjà créées (évite de les répéter):\n`
      existingQuestions.forEach((q, index) => {
        prompt += `${index + 1}. ${q.question_text}\n`
      })
    }

    prompt += `\n\nRéponds uniquement avec un JSON valide dans ce format exact:
{
  "questions": [
    {
      "question_text": "Ta question ici",
      "question_type": "text" ou "multiple_choice",
      "correct_answer": "La réponse correcte",
      "choice_a": "Premier choix (uniquement pour multiple_choice)",
      "choice_b": "Deuxième choix (uniquement pour multiple_choice)",
      "choice_c": "Troisième choix (optionnel pour multiple_choice)",
      "choice_d": "Quatrième choix (optionnel pour multiple_choice)"
    }
  ]
}

Règles importantes:
- Pour les questions "text", ne mets pas de choix (choice_a, choice_b, etc.)
- Pour les questions "multiple_choice", inclus au minimum choice_a et choice_b
- Les réponses correctes doivent être précises et éducatives
- Varie les types de questions (text et multiple_choice)
- Assure-toi que le JSON est valide sans caractères d'échappement supplémentaires`

    return prompt
  }

  static parseAIResponse(content) {
    try {
      // Nettoyer le contenu au cas où il y aurait du texte supplémentaire
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Aucun JSON trouvé dans la réponse')
      }

      const jsonStr = jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Format de réponse invalide: questions manquantes')
      }

      // Valider chaque question
      const validQuestions = parsed.questions.map((q, index) => {
        if (!q.question_text || !q.question_type || !q.correct_answer) {
          throw new Error(`Question ${index + 1}: champs obligatoires manquants`)
        }

        if (!['text', 'multiple_choice'].includes(q.question_type)) {
          throw new Error(`Question ${index + 1}: type invalide`)
        }

        if (q.question_type === 'multiple_choice' && (!q.choice_a || !q.choice_b)) {
          throw new Error(`Question ${index + 1}: choix A et B obligatoires pour QCM`)
        }

        return {
          question_text: q.question_text.trim(),
          question_type: q.question_type,
          correct_answer: q.correct_answer.trim(),
          choice_a: q.choice_a ? q.choice_a.trim() : null,
          choice_b: q.choice_b ? q.choice_b.trim() : null,
          choice_c: q.choice_c ? q.choice_c.trim() : null,
          choice_d: q.choice_d ? q.choice_d.trim() : null,
          question_image_url: null // Pas d'image générée par l'IA
        }
      })

      return validQuestions

    } catch (error) {
      console.error('Erreur parsing:', error)
      throw new Error(`Erreur lors de l'analyse de la réponse IA: ${error.message}`)
    }
  }
}
