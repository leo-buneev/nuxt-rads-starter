import _ from 'lodash'
import { execSync } from 'node:child_process'

export default {
  getCommitCount,
  getPackageVersion,

  getShortVersion() {
    return `${getPackageVersion()}.${getCommitCount()}`
  },

  getVersion(mode) {
    mode = mode || process.env.NODE_ENV
    const majorMinor = this.getPackageVersion()

    if (mode !== 'production') {
      return `${majorMinor}.0-DEV`
    }

    const date = new Date()
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const timeStr = `${pad(date.getHours())}-${pad(date.getMinutes())}`
    const commitCount = getCommitCount()
    const branchName = getBranchOrTagName()

    let lastCommitHash = execSync(`git log -n 1 --pretty=format:"%H" ${branchName}`).toString() // "fc558cd6513cb98bd838edd415a1232090a1f455"
    lastCommitHash = lastCommitHash.trim().slice(0, 8)
    const isTestEnvironment = ['master', 'origin/master'].includes(branchName)
    const suffix = isTestEnvironment ? '-alpha' : ''
    const result = `${majorMinor}.${commitCount}${suffix}+${lastCommitHash}.${dateStr}.${timeStr}`
    console.info(`VERSION: ${result}`)
    return result
  },
}

function getPackageVersion() {
  const packageJsonVersion = process.env.npm_package_version || '0.0.0' // version from package.json
  const [major, minor] = packageJsonVersion.split('.')
  return `${major}.${minor}`
}

function getCommitCount() {
  try {
    const branchName = getBranchOrTagName()
    const commitCount = execSync(`git rev-list --count ${branchName} --`).toString().trim()
    console.info(`-- Commit count: ${commitCount}`)
    const result = Number(commitCount)
    if (_.isNaN(result)) throw new Error(`Unexpected commit count: ${commitCount}`)
    return result
  } catch (e) {
    console.warn('!!! If building locally, make sure your branch is pushed!')
    throw e
  }
}

function pad(number) {
  number = number.toString()
  if (number.length <= 1) return `0${number}`
  return number
}

function getBranchOrTagName() {
  const result = getBranchName() || getTagName()
  if (!result) throw new Error('Cannot detect branch or tag name')
  return result
}

function getBranchName() {
  const isBamboo = !!process.env.bamboo_planRepository_branch
  let branchName =
    process.env.bamboo_planRepository_branch || // Bamboo
    process.env.CI_COMMIT_BRANCH // GitLab CI

  if (!branchName) branchName = execSync('git branch --show-current').toString()
  branchName = branchName.trim()

  if (!branchName) return ''

  if (isBamboo || branchName.startsWith('origin')) return branchName
  return `origin/${branchName}`
}

function getTagName() {
  const tagName = execSync('git tag --points-at HEAD').toString()
  return tagName.trim()
}
