class Scene {
    constructor(WorldInstance) {
        Object.defineProperties(this,
            {
                world: {
                    value: WorldInstance
                }
            }
        )
    }
}