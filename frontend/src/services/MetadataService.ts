import { config } from '../config';
import axios from 'axios';

export default class MetadataService {

  static METADATA_URL: string = config.METADATA_URL;

  static async fetchMetadata(videoId: string, videoLangCode: string, videoTranslCode: string) {
    try {
      const response = await axios.get(this.METADATA_URL, {
        headers: {
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        },
        params: {
          videoId: videoId,
        }
      });
      const metadata = response.data;
      metadata['id'] = videoId;
      metadata['url'] = `https://www.youtube.com/watch?v=${videoId}`;
      metadata['langCode'] = videoLangCode;
      metadata['translCode'] = videoTranslCode;
      return metadata;
    } catch (err) {
      console.log(err.message);
    }
  }
}
