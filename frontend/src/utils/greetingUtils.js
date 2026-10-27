/**
 * Shet Samarthan Time-based Greeting Utility as per Indian Standard Time (IST - Asia/Kolkata)
 * 
 * Morning:   04:00 - 11:59 -> Good morning / शुभ सकाळ / शुभ प्रभात
 * Afternoon: 12:00 - 16:59 -> Good afternoon / शुभ दुपार / शुभ दोपहर
 * Evening:   17:00 - 20:59 -> Good evening / शुभ संध्याकाळ / शुभ संध्या
 * Night:     21:00 - 03:59 -> Good evening (or respectful nighttime welcome) / शुभ रात्री / शुभ रात्रि
 */

export function getIndiaHour() {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false
    });
    const formatted = formatter.format(new Date());
    const hour = parseInt(formatted, 10);
    return isNaN(hour) ? new Date().getHours() : hour;
  } catch (e) {
    return new Date().getHours();
  }
}

export function getIndiaGreeting(lang = 'en') {
  const hour = getIndiaHour();

  if (hour >= 4 && hour < 12) {
    if (lang === 'mr') return 'शुभ सकाळ';
    if (lang === 'hi') return 'शुभ प्रभात';
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    if (lang === 'mr') return 'शुभ दुपार';
    if (lang === 'hi') return 'शुभ दोपहर';
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    if (lang === 'mr') return 'शुभ संध्याकाळ';
    if (lang === 'hi') return 'शुभ संध्या';
    return 'Good evening';
  } else {
    // Night (9 PM to 3:59 AM)
    if (lang === 'mr') return 'शुभ रात्री';
    if (lang === 'hi') return 'शुभ रात्रि';
    return 'Good evening'; // In English, "Good evening" is used as the arrival greeting at night
  }
}
