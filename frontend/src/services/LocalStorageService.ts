import MetadataService from "./MetadataService";
import { config } from '../config';
import { VideoMetadata } from '../types/VideoMetadata';

export default class LocalStorageService {
  public static getHistoryList() {
    return this.get(config.LOCAL_STORAGE.HISTORY) || [];
  }

  public static setHistoryList(list: Record<string, unknown>) {
    return this.set(config.LOCAL_STORAGE.HISTORY, list);
  }

  public static async pushVideoToHistory(videoId: string, videoLangCode: string, videoTranslCode: string) {
    const list = this.getHistoryList();
    const metadata = await MetadataService.fetchMetadata(videoId, videoLangCode, videoTranslCode);
    list.unshift(metadata);
    this.setHistoryList(list);
  }

  public static removeVideo(videoId: string) {
    let list = this.getHistoryList();
    list = list.filter((item: VideoMetadata) => {
      if (item.id === videoId) {
        return false;
      } else {
        return true;
      }
    });
    this.setHistoryList(list);
  }

  public static get(key: string): any {
    const value = localStorage.getItem(key);
    if (!value) {
      return null;
    } else {
      try {
        return JSON.parse(value);
      } catch(e) {
        return value;
      }
    }
  }

  public static set(key: string, value: Record<string, unknown>): boolean {
    let success = false;
    if (value && typeof value === "object") {
      localStorage.setItem(key, JSON.stringify(value));
      success = true;
    } else {
      localStorage.setItem(key, value);
      success = true;
    }
    return success;
  }

  public static remove(key: string): void {
    localStorage.removeItem(key);
  }
}
