// Netlify/Vercel Serverless Function for Voting

export default async function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.status(200).end()
    return
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { sessionCode, recipeUrl, userId } = request.body

    if (!sessionCode || !recipeUrl || !userId) {
      response.status(400).json({ error: 'Session code, recipe URL, and user ID required' })
      return
    }

    // Get session
    const session = await getSessionByCode(sessionCode)
    
    if (!session) {
      response.status(404).json({ error: 'Session not found' })
      return
    }

    // Check if session has expired
    if (session.expiresAt <= Date.now()) {
      response.status(404).json({ error: 'Session has expired' })
      return
    }

    // Find the recipe
    const recipe = session.recipes.find(r => r.url === recipeUrl)
    if (!recipe) {
      response.status(404).json({ error: 'Recipe not found in session' })
      return
    }

    // Check if user already voted
    const user = session.users.find(u => u.id === userId)
    if (!user) {
      response.status(403).json({ error: 'User not in session' })
      return
    }

    // Remove previous vote if exists
    if (user.votedFor) {
      const previousRecipe = session.recipes.find(r => r.url === user.votedFor)
      if (previousRecipe) {
        previousRecipe.votes = Math.max(0, previousRecipe.votes - 1)
      }
    }

    // Toggle vote or add new vote
    if (user.votedFor === recipeUrl) {
      // Remove vote (toggle off)
      user.votedFor = null
      user.hasVoted = false
      recipe.votes = Math.max(0, recipe.votes - 1)
    } else {
      // Add vote
      user.votedFor = recipeUrl
      user.hasVoted = true
      recipe.votes = (recipe.votes || 0) + 1
    }

    // Update session in database
    await updateSession(session)

    // Broadcast update via WebSocket/Realtime service
    await broadcastSessionUpdate(session)

    response.status(200).json({
      success: true,
      session,
      userVote: user.votedFor
    })

  } catch (error) {
    console.error('Error processing vote:', error)
    response.status(500).json({ error: 'Internal server error' })
  }
}

async function getSessionByCode(code) {
  // Same as join-session.js
  console.log('Getting session by code:', code)
  return null // Demo
}

async function updateSession(session) {
  // Same as join-session.js
  console.log('Updating session:', session.code)
}

async function broadcastSessionUpdate(session) {
  // This would send updates to all connected users via WebSocket
  // Using services like Pusher, Ably, or Supabase Realtime
  
  console.log('Broadcasting session update:', session.code)
  
  // Example with Pusher:
  /*
  await pusher.trigger(`session_${session.code}`, 'session_update', {
    type: 'session_update',
    session: session,
    users: session.users
  })
  */
  
  // Example with Supabase Realtime:
  /*
  await supabase.channel(`session_${session.code}`)
    .send({
      type: 'broadcast',
      event: 'session_update',
      payload: { session, users: session.users }
    })
  */
}
