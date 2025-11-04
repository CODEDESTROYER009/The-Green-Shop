
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
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Clean old installs to avoid cache issues
                sh 'rm -rf node_modules package-lock.json'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                // Verify vite version instead of checking old path
                sh 'npx vite --version'
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }

        stage('Deploy to Render') {
            when { branch 'main' }
            environment {
                RENDER_DEPLOY_HOOK = 'https://api.render.com/deploy/srv-xxxxx?key=${RENDER_DEPLOY_KEY}'
            }
            steps {
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_KEY', variable: 'RENDER_DEPLOY_KEY')]) {
                    script {
                        def deployUrl = env.RENDER_DEPLOY_HOOK.replace('${RENDER_DEPLOY_KEY}', RENDER_DEPLOY_KEY)
                        sh "curl -X POST '${deployUrl}'"
                        echo "✅ Deployment triggered successfully"
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
