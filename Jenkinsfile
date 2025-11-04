
pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'production'
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
                    npm ci
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
            when { branch 'main' }
            steps {
                echo "🚀 Triggering Render deployment..."
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_KEY', variable: 'RENDER_DEPLOY_KEY')]) {
                    script {
                        def serviceId = "srv-d455f3ali9vc73cgh4bg"  // replace with your actual Render service ID
                        def deployUrl = "https://api.render.com/deploy/${serviceId}?key=${RENDER_DEPLOY_KEY}"
                        sh "curl -X POST '${deployUrl}'"
                        echo "✅ Render deployment triggered successfully."
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
