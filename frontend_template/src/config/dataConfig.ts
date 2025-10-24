// 新建文件: /src/config/date.ts
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import updateLocale from 'dayjs/plugin/updateLocale';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

export function setupDayjs() {
  dayjs.extend(updateLocale);
  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime);
  dayjs.locale('zh-cn');
}

export default {
  setup: setupDayjs
};