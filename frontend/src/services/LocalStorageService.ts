export default class LocalStorageService {
  public static getHistoryList() {
    return this.get("youtube-dictation-videos")
  }

  public static pushVideo() { // includes user progress
    const list = this.getHistoryList();

  }

  public static removeVideo(videoId: string) {
    const list = this.getHistoryList();

  }

  public static getProgress(videoId: string) {
    const list = this.getHistoryList();
    
  }

  public static saveProgress(videoId: string) {
    const list = this.getHistoryList();

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
