
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
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npx vite build'
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
                        echo "Deployment triggered successfully"
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
