pipeline {
  agent any

  stages {
    stage('Clean workspace') {
      steps {
        cleanWs()
      }
    }

    stage("Checkout from SCM") {
      steps {
        git branch: 'main', url: 'https://github.com/mirindaq/EcommerceMobile'
        echo "✅ Checked out code successfully 123"
      }
    }

    // stage("Copy env files") {
    //   steps {
    //     sh '''
    //       echo "📁 Copying environment files..."
          
    //       # Copy Backend env files
    //       mkdir -p Back-End/env
    //       cp /home/ubuntu/EcommerceMobile/env/prod.env Back-End/env/prod.env
    //       cp /home/ubuntu/EcommerceMobile/env/dev.env Back-End/env/dev.env
          
    //       # Copy Frontend env file
    //       cp /home/ubuntu/EcommerceMobile/env/fe.env Front-End/.env
          
    //       echo "📋 Verifying copied files..."
    //       ls -la Back-End/env/
    //       ls -la Front-End/.env
          
    //       echo "✅ Environment files copied successfully"
    //     '''
    //   }
    // }

    // stage("Deployment") {
    //   steps {
    //     sh """
    //       echo "🚀 Starting deployment..."
    //       echo "🧹 Stopping and removing old containers..."

    //       docker-compose down || true

    //       echo "🔧 Building and starting containers with production environment..."
    //       docker-compose up -d --build

    //       echo "✅ Deployment completed successfully!"
    //     """
    //   }
    // }
  }
}
