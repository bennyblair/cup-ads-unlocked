declare module "pngjs" {
  class PNG {
    width: number
    height: number
    data: Buffer
  }

  namespace PNG {
    namespace sync {
      function read(buffer: Buffer): PNG
    }
  }

  export { PNG }
}
