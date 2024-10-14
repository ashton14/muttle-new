import { PathLike } from 'fs';
import { unlink } from 'fs/promises';

export const deleteIfExists = async (path: PathLike) => {
  try {
    console.log(`Deleting ${path}`);
    await unlink(path);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log(`${path} does not exist, skipping delete`);
    } else {
      throw err;
    }
  }
};
