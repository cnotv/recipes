// Netlify/Vercel Serverless Function for Creating Voting Sessions
// This would be deployed as a serverless function

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
    const { name, recipes, userId } = request.body

    if (!name || !recipes || !Array.isArray(recipes) || recipes.length < 2) {
      response.status(400).json({ error: 'Invalid session data' })
      return
    }

    // Generate unique session code
    const sessionCode = generateSessionCode()
    
    // Create session object
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      code: sessionCode,
      recipes: recipes.map(recipe => ({
        ...recipe,
        votes: 0
      })),
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      createdBy: userId,
      users: [{
        id: userId,
        name: 'Session Creator',
        hasVoted: false
      }]
    }

    // In a real implementation, you would save this to a database
    // For demo purposes, we'll use a simple in-memory store or external service
    await saveSession(session)

    response.status(200).json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error creating session:', error)
    response.status(500).json({ error: 'Internal server error' })
  }
}

function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function saveSession(session) {
  // This would connect to your database (MongoDB, Supabase, Firebase, etc.)
  // For demo purposes:
  console.log('Saving session:', session.code)
  
  // Example with Supabase:
  /*
  const { data, error } = await supabase
    .from('voting_sessions')
    .insert([session])
  
  if (error) throw error
  return data
  */
}

// WebSocket connection handler would be separate
// You could use services like:
// - Pusher
// - Ably
// - Socket.io with a separate server
// - Supabase Realtime
// - Firebase Realtime Database
