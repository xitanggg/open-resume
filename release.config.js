module.exports = {
  branches: ['main'],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
    ['@codedependant/semantic-release-docker', {
      dockerImage: 'open-resume',
      dockerProject: 'tiflo',
    }]
  ]
}