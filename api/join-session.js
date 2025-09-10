// Netlify/Vercel Serverless Function for Joining Voting Sessions

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
    const { code, userId } = request.body

    if (!code || !userId) {
      response.status(400).json({ error: 'Session code and user ID required' })
      return
    }

    // Find session by code
    const session = await getSessionByCode(code)
    
    if (!session) {
      response.status(404).json({ error: 'Session not found or expired' })
      return
    }

    // Check if session has expired
    if (session.expiresAt <= Date.now()) {
      response.status(404).json({ error: 'Session has expired' })
      return
    }

    // Add user to session if not already present
    const existingUser = session.users.find(user => user.id === userId)
    if (!existingUser) {
      session.users.push({
        id: userId,
        name: `User ${session.users.length + 1}`,
        hasVoted: false
      })
      
      // Update session in database
      await updateSession(session)
    }

    response.status(200).json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error joining session:', error)
    response.status(500).json({ error: 'Internal server error' })
  }
}

async function getSessionByCode(code) {
  // This would query your database
  console.log('Getting session by code:', code)
  
  // Example with Supabase:
  /*
  const { data, error } = await supabase
    .from('voting_sessions')
    .select('*')
    .eq('code', code)
    .single()
  
  if (error) throw error
  return data
  */
  
  // For demo, return null (session not found)
  return null
}

async function updateSession(session) {
  // This would update the session in your database
  console.log('Updating session:', session.code)
  
  // Example with Supabase:
  /*
  const { data, error } = await supabase
    .from('voting_sessions')
    .update(session)
    .eq('id', session.id)
  
  if (error) throw error
  return data
  */
}
