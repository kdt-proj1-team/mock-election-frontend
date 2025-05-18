import { format, parseISO, formatDistanceToNowStrict, isBefore, subHours } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDateTime = (isoString) => {
  return format(parseISO(isoString), 'yyyy.MM.dd HH:mm');
};

// 날짜 변환
export const formatPostTimeSmart = (isoString) => {
  const createdAt = new Date(isoString);
  const twentyFourHoursAgo = subHours(new Date(), 24);

  if (isBefore(twentyFourHoursAgo, createdAt)) {
    return formatDistanceToNowStrict(createdAt, { addSuffix: true, locale: ko });
  } else {
    return format(createdAt, "yyyy.MM.dd");
  }
};