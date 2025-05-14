import { format, parseISO } from 'date-fns';

export const formatDateTime = (isoString) => {
  return format(parseISO(isoString), 'yyyy.MM.dd HH:mm');
};