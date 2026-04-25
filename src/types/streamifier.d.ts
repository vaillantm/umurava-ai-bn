declare module 'streamifier' {
  import { Readable } from 'stream';
  export function createReadStream(object: any, options?: any): Readable;
}