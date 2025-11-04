pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')  // checks every 2 minutes for new commits on GitHub
    }

    environment {
        CI = 'true'
        NODE_ENV = 'development'
        VITE_SUPABASE_URL = credentials('SUPABASE_URL')
        VITE_SUPABASE_PUBLISHABLE_KEY = credentials('SUPABASE_KEY')
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📦 Checking out code..."
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "📥 Installing dependencies..."
                sh '''
                    rm -rf node_modules package-lock.json
                    npm install --include=dev
                '''
            }
        }

        stage('Build') {
            steps {
                echo "🏗️ Building the project..."
                sh '''
                    npx vite --version
                    npx vite build
                '''
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }

        stage('Deploy to Render') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                echo "🚀 Starting Render deployment..."
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_KEY', variable: 'RENDER_API_KEY')]) {
                    script {
                        // Verify the service ID is correct
                        def serviceId = "srv-d455f3ali9vc73cgh4bg"  // Double-check this ID in your Render dashboard
                        def deployUrl = "https://api.render.com/v1/services/${serviceId}/deploys"
                        
                        echo "🔑 Using Render service ID: ${serviceId}"
                        
                        // Install curl if not already installed
                        sh 'command -v curl || (echo "curl not found, installing..." && apt-get update && apt-get install -y curl)'
                        
                        // Make the API request with proper headers and error handling
                        def response = sh(
                            script: """
                                curl -s -o response.txt -w '%{http_code}' -X POST \
                                -H "Authorization: Bearer ${RENDER_API_KEY}" \
                                -H "Accept: application/json" \
                                -H "Content-Type: application/json" \
                                "${deployUrl}"
                            """,
                            returnStdout: true
                        ).trim()
                        
                        // Get the response content
                        def responseCode = response.tokenize('\n').last()
                        def responseContent = sh(script: 'cat response.txt', returnStdout: true).trim()
                        
                        echo "📡 API Response Code: ${responseCode}"
                        echo "📄 API Response: ${responseContent}"
                        
                        if (responseCode != '201') {
                            error("❌ Failed to trigger Render deployment. Status: ${responseCode}")
                        } else {
                            echo "✅ Successfully triggered Render deployment"
                            echo "🔗 Check deployment status at: https://dashboard.render.com/static/srv/${serviceId}"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎯 Pipeline completed successfully."
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
        always {
            echo "🧹 Cleaning workspace..."
            cleanWs()
        }
    }
}
