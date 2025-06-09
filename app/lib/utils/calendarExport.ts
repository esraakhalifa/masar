import type { UserProfile } from '../types/profile';

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

export function generateCalendarEvents(profile: UserProfile) {
  const events: CalendarEvent[] = [];

  // Add education events
  profile.education.forEach(edu => {
    events.push({
      title: `Education: ${edu.degree} in ${edu.fieldOfStudy}`,
      start: new Date(edu.graduationYear, 0, 1),
      end: new Date(edu.graduationYear, 0, 1),
      description: `${edu.institution}`,
      location: edu.institution
    });
  });

  // Add work experience events
  profile.experience.forEach(exp => {
    events.push({
      title: `Work: ${exp.title} at ${exp.company}`,
      start: new Date(exp.startDate),
      end: exp.endDate ? new Date(exp.endDate) : new Date(),
      description: exp.description,
      location: exp.company
    });
  });

  // Generate iCalendar format
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Career Profile//Career Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Career Events',
    'X-WR-TIMEZONE:UTC',
    ...events.flatMap(event => [
      'BEGIN:VEVENT',
      `DTSTART:${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${event.end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT'
    ]),
    'END:VCALENDAR'
  ].join('\r\n');

  // Create and download the file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'career-events.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 