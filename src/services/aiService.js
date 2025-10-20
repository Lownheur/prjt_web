<<<<<<< HEAD
const OPENROUTER_API_KEY = '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'
=======
const OPENROUTER_API_KEY = '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'
>>>>>>> 11a469a1d232b5dda32ac6e19d38771ec7ac5601
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Modèles gratuits disponibles sur OpenRouter
const MODEL = 'meta-llama/llama-4-maverick:free' // Alternative: 'meta-llama/llama-3.2-3b-instruct:free', 'qwen/qwen-2-7b-instruct:free'

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
<<<<<<< HEAD
      console.log(`Génération avec IA`)
=======
>>>>>>> 11a469a1d232b5dda32ac6e19d38771ec7ac5601
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
          max_tokens: Math.min(4000, questionCount * 150 + 500)
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
      console.log('Questions générées avec succès')
      return { success: true, questions, usedModel: MODEL.split('/')[1]?.split(':')[0] || 'IA' }

    } catch (error) {
      console.error('Erreur génération IA:', error)
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la génération des questions'
      }
    }
  }

  static buildPrompt(title, description, existingQuestions, additionalContext, questionCount) {
    let prompt = `Génère exactement ${questionCount} questions de quiz sur le thème "${title}"`
    
    if (description) {
      prompt += ` avec la description suivante: "${description}"`
    }

    if (additionalContext) {
      prompt += `\n\nContexte supplémentaire: ${additionalContext}`
    }

    if (existingQuestions.length > 0) {
      prompt += `\n\nQuestions déjà créées (évite de les répéter):\n`
      existingQuestions.slice(0, 10).forEach((q, index) => {
        prompt += `${index + 1}. ${q.question_text}\n`
      })
      if (existingQuestions.length > 10) {
        prompt += `... et ${existingQuestions.length - 10} autres questions\n`
      }
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
- Génère exactement ${questionCount} questions, ni plus ni moins
- Pour les questions "text", ne mets pas de choix (choice_a, choice_b, etc.)
- Pour les questions "multiple_choice", inclus au minimum choice_a et choice_b
- Les réponses correctes doivent être précises et éducatives
- Varie les types de questions (text et multiple_choice)
- Assure-toi que le JSON est valide sans caractères d'échappement supplémentaires
${questionCount > 10 ? '- Évite les répétitions en variant les angles d\'approche du sujet' : ''}`

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
