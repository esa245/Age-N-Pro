export interface AgeDetails {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  daysUntilBday: number;
}

export function getDetailedAge(dobString: string, referenceDate?: Date, dodString?: string): AgeDetails {
  const birth = new Date(dobString);
  const end = dodString ? new Date(dodString) : (referenceDate || new Date());

  let years = end.getFullYear() - birth.getFullYear();
  let months = end.getMonth() - birth.getMonth();
  let days = end.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = Math.abs(end.getTime() - birth.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diffTime / (1000 * 60));
  const totalSeconds = Math.floor(diffTime / 1000);

  let daysUntilBday = 0;
  if (!dodString) {
    let nextBirthday = new Date(end.getFullYear(), birth.getMonth(), birth.getDate());
    const isToday = end.getMonth() === birth.getMonth() && end.getDate() === birth.getDate();
    if (end > nextBirthday && !isToday) {
      nextBirthday.setFullYear(end.getFullYear() + 1);
    }
    if (!isToday) {
      daysUntilBday = Math.ceil((nextBirthday.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  return {
    years,
    months,
    days,
    hours: end.getHours(),
    minutes: end.getMinutes(),
    seconds: end.getSeconds(),
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    daysUntilBday,
  };
}

export const relationsData = [
  { value: "বাবা", bn: "বাবা (Father)", en: "Father" },
  { value: "মা", bn: "মা (Mother)", en: "Mother" },
  { value: "ভাই", bn: "ভাই (Brother)", en: "Brother" },
  { value: "বোন", bn: "বোন (Sister)", en: "Sister" },
  { value: "স্বামী/স্ত্রী", bn: "স্বামী/স্ত্রী (Spouse)", en: "Spouse" },
  { value: "সন্তান", bn: "সন্তান (Child)", en: "Child" },
  { value: "অন্যান্য", bn: "অন্যান্য (Other)", en: "Other" },
];
