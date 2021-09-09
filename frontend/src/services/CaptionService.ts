import { Track } from '../types/Track';
import { Caption } from '../types/Caption';
import { config } from '../config';
import axios from 'axios';

export default class CaptionService {

  static CAPTION_URL: string = config.CAPTION_URL;
  static CAPTION_TRACK_URL: string = config.CAPTION_TRACKS_URL;

  /**
   * 
   * @param videoId 
   * @returns 
   */
  static async fetchCaptionTracks(videoId: string) {
    let captionTracks: Track[] = [];
    try {
      const response = await axios.get(this.CAPTION_TRACK_URL, {
        headers: {
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        },
        params: {
          videoId: videoId,
        }
      })
      captionTracks = response.data;  
    } catch (err) {
      console.log(err.message);
    }
    return captionTracks;
  }

  /**
   * 
   * @param videoId 
   * @param videoLangCode 
   * @param videoTranslCode 
   * @returns 
   */
  static async fetchCaptions(videoId: string, videoLangCode: string, videoTranslCode: string) {
    let captionLines: Caption[] = [];
    let arrayStartTimeMs: number[] = [];
    try {
      const captionsResponse = await axios.get(this.CAPTION_URL, {
        headers: {
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        },
        params: {
          videoId: videoId,
          langCode: videoLangCode,
        }
      });
      const translationResponse = await axios.get(this.CAPTION_URL, {
        params: {
          videoId: videoId,
          langCode: videoTranslCode,
        }
      });
      let captions = captionsResponse.data;
      let translations = translationResponse.data;

      let i = 0;
      captions.forEach((item: any) => {
        // match each caption with the correct translation
        let done = false;
        if (i >= translations.length) {
          item["translation"] = "";
          return;
        }
        let tl = translations[i].text;
        let length = item.endTimeMs - item.startTimeMs;
        let start = (item.startTimeMs >= translations[i].startTimeMs) ? item.startTimeMs : translations[i].startTimeMs;
        let end = (item.endTimeMs < translations[i].endTimeMs) ? item.endTimeMs : translations[i].endTimeMs;
        while (!done) {
          let overlap = (end - start) / length;
          if (item.endTimeMs <= translations[i].endTimeMs) {
            // 1. 이번 칸이 현재 번역칸보다 먼저 끝남. 즉, 다음 번역칸을 볼 필요가 없음. 이번 칸은 끝났으니 다음 item으로. 
            if (overlap <= 0) {
              // 1-1. 겹치는 부분이 하나도 없을 경우 --> 번역이 존재하지 않는 상태.
              tl = "";
            } else if (overlap >= 0.75 && translations[i].endTimeMs - item.endTimeMs < 1000) {
              // 1-2. 커버리지가 훌륭 & 번역칸 남은 길이가 2초 미만 --> 현재 번역칸은 다음 item에 기여하지 않을 거라 간주, 다음 번역칸으로 넘어감.
              i ++;
            } // 그 외의 경우 --> 번역칸은 넘기지 않고 그대로 유지.
            item["translation"] = tl;
            done = true;
          } else {
            // 2. 이번 칸이 현재 번역칸보다 나중에 끝남. 즉, 필요한 내용이 다음 번역칸에도 나올 수도 있음.
            if (overlap >= 0.75) {
              // 2-1. 충분한 커버리지 --> 이번 칸은 완료했으니 다음 item으로. 다음 item은 현재 번역칸과 겹칠 일이 없으니, 번역칸도 다음으로 넘김.
              item["translation"] = tl;
              done = true;
              i ++;
            } else if (overlap <= 0) {
              // 2-2. 겹치는 부분이 하나도 없을 경우
              if (i + 1 < translations.length) {
                // 다음 번역칸이 존재한다면 --> 아직 완료되지 않음! 이번 번역칸 내용은 버리고 다음 번역칸으로 넘어감. 타임 업데이트 할 것!
                i ++;
                tl = translations[i].text;
                start = (item.startTimeMs >= translations[i].startTimeMs) ? item.startTimeMs : translations[i].startTimeMs;
                end = (item.endTimeMs < translations[i].endTimeMs) ? item.endTimeMs : translations[i].endTimeMs;
              } else {
                // 다음 번역칸은 없음 --> 즉, 번역이 존재하지 않으므로, 완료하고 다음 item으로.
                i = translations.length; // 또는 i ++;
                item["translation"] = "";
                done = true;
              }
            } else {
              // 2-3. 커버리지가 충분하지 않을 경우. 다음 번역칸과 이어줘야 할 수도 있다.
              if ((i + 1 < translations.length) && (translations[i+1].startTimeMs < item.endTimeMs)) {
                // 다음 번역칸이 존재하고 & 다음 번역칸이 커버리지를 발생시킴 --> 다음 번역칸과 concat하고 끝 타임 업데이트
                i ++;
                tl += " " + translations[i].text;
                end = (item.endTimeMs < translations[i].endTimeMs) ? item.endTimeMs : translations[i].endTimeMs;
              } else {
                // 다음 번역칸이 없거나, 있어도 커버리지가 없음 --> 이대로 완료하고 다음 번역칸으로 넘어감.
                item["translation"] = tl;
                done = true;
                i++;
              }
            }
          }
        }
      });

      captionLines = captions;
      arrayStartTimeMs = captionLines.map(item => item.startTimeMs);
    } catch(err) {
      console.log(err.message);
      // do something (elegant fail)
    }

    return {
      captionLines: captionLines,
      arrayStartTimeMs: arrayStartTimeMs,
    };
  }
}
