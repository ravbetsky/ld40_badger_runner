export const centerGameObjects = (objects) => {
  objects.forEach(function (object) {
    object.anchor.setTo(0.5)
  })
}

export class ProceduralManager {
  constructor(...args) {
    this.manager = {}
    args.forEach( arg => {
      this.manager[arg] = {
        latestSection: 0
      }
    })
  }
  isAllowedToCreate(key, index) {
    const currentLatest = this.manager[key].latestSection
    const intervalMin = this.manager[key].interval.min
    const intervalMax = this.manager[key].interval.max
    if(intervalMax === index - currentLatest) {
      return true
    } else if(intervalMin <= index - currentLatest) {
      return Math.round(Math.random())
    }
    return false
  }
  setLatestSection(key, index) {
    this.manager[key].latestSection = index
  }
  setSecureRange(key, range) {
    this.manager[key].secureRange = range
  }
  setIntervalToCreate(key, min, max) {
    this.manager[key].interval = { min, max }
  }
}

// export ProceduralManager;
