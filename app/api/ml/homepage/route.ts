import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

interface MLResponse {
  post_analysis: {
    top_topics: Record<string, number>
    avg_post_length: number
    total_posts: number
    categories: string[]
  }
  stories_analysis: {
    total_stories: number
    media_type_distribution: Record<string, number>
    premium_stories_percent: number
    viewed_stories_percent: number
    avg_duration: number
    categories: string[]
  }
  recommendations: {
    suggested_topics: string[]
    optimal_posting_times: number[]
    content_type_distribution: Record<string, number>
    recommended_categories: string[]
  }
}

interface AnalyzeRequest {
  userId: string
  age: number
  isAgeVerified: boolean
  posts: any[]
  stories: any[]
}

export async function POST(req: NextRequest) {
  try {
    const data: AnalyzeRequest = await req.json()
    
    // Ensure stories have required fields
    const processedData = {
      ...data,
      stories: data.stories.map(story => ({
        ...story,
        type: story.type || 'image',  // Default to image type if missing
        isPremium: story.isPremium || false,
        isViewed: story.isViewed || false,
        duration: story.duration || 10
      }))
    }
    
    // Create a temporary data file for Python script
    const tempDataPath = path.join(process.cwd(), 'temp_analysis_data.json')
    fs.writeFileSync(tempDataPath, JSON.stringify(processedData))
    
    // Run Python analysis script
    const pythonScript = path.join(process.cwd(), 'ml', 'homepage_analysis.py')
    
    return new Promise((resolve) => {
    const pythonProcess = spawn('python3', [
      pythonScript,
      '--data', tempDataPath,
      '--age', data.age.toString(),
      '--verified', data.isAgeVerified.toString()
    ])
      
      let outputData = ''
      let errorOutput = ''
      
      pythonProcess.stdout.on('data', (data) => {
        const str = data.toString()
        // Only add to output if it looks like JSON
        if (str.trim().startsWith('{')) {
          outputData += str
        } else {
          errorOutput += str
          console.error(`ML stdout: ${str}`)
        }
      })
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
        console.error(`ML stderr: ${data}`)
      })
      
      pythonProcess.on('close', (code) => {
        try {
          // Clean up temp file
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath)
          }
          
          if (code !== 0 || !outputData.trim()) {
            console.error('Python process exited with code:', code)
            console.error('Error output:', errorOutput)
            
            // Return default recommendations if ML fails or no valid output
            resolve(NextResponse.json({
              post_analysis: {
                top_topics: {},
                avg_post_length: 0,
                total_posts: data.posts.length,
                categories: ['general']
              },
              stories_analysis: {
                total_stories: data.stories.length,
                media_type_distribution: {},
                premium_stories_percent: 0,
                viewed_stories_percent: 0,
                avg_duration: 0,
                categories: ['general']
              },
              recommendations: {
                suggested_topics: [],
                optimal_posting_times: [],
                content_type_distribution: {},
                recommended_categories: ['general']
              }
            }))
            return
          }
          
          try {
            const results = JSON.parse(outputData) as MLResponse
            // Check if analysis results are null, if so use defaults
            if (!results.post_analysis || !results.stories_analysis) {
              resolve(NextResponse.json({
                post_analysis: {
                  top_topics: {},
                  avg_post_length: 0,
                  total_posts: data.posts.length,
                  categories: ['general']
                },
                stories_analysis: {
                  total_stories: data.stories.length,
                  media_type_distribution: {},
                  premium_stories_percent: 0,
                  viewed_stories_percent: 0,
                  avg_duration: 0,
                  categories: ['general']
                },
                recommendations: results.recommendations || {
                  suggested_topics: [],
                  optimal_posting_times: [],
                  content_type_distribution: {},
                  recommended_categories: ['general']
                }
              }))
              return
            }
            resolve(NextResponse.json(results))
          } catch (e) {
            console.error('Error parsing ML output:', e)
            resolve(NextResponse.json(
              { error: 'Invalid ML output' },
              { status: 500 }
            ))
          }
        } catch (error) {
          console.error('Error in python process cleanup:', error)
          resolve(NextResponse.json(
            { error: 'ML process error' },
            { status: 500 }
          ))
        }
      })
    })
  } catch (error) {
    console.error('ML API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
