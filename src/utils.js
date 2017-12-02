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
  setLatestSection(key, index) {
    this.manager[key].latestSection = index
  }
  isAllowedToCreate(key, minInterval, maxInterval, index) {
    const currentLatest = this.manager[key].latestSection
    if(maxInterval === index - currentLatest) {
      return true
    } else if(minInterval <= index - currentLatest) {
      return Math.round(Math.random())
    }
    return false
  }
}

// export ProceduralManager;
