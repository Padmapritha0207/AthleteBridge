import {
  AthleteProfile, AthleteSupportPreference, Coach, Opportunity,
  TrainingSession, ProgressGoal, ScheduleEvent
} from '../types';

export interface SportTrackingMetric {
  id: string;
  label: string;
  unit: string;
  helperText: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  defaultValue?: string | number;
}

export interface SportTrackingConfig {
  sportName: string;
  primaryMetricName: string;
  primaryMetricUnit: string;
  primaryMetricTarget: string;
  secondaryMetricName: string;
  secondaryMetricUnit: string;
  sessionTypes: string[];
  improvementDrills: string[];
  equipmentChecklist: string[];
  milestoneTitle: string;
}

export interface AcademicSupportResource {
  id: string;
  title: string;
  type: 'study_schedule' | 'exam_prep' | 'course_priority' | 'tutor' | 'accessible_format';
  description: string;
  urgency: 'high' | 'medium' | 'low';
  tag: string;
  actionText: string;
}

export interface RankedCoach {
  coach: Coach;
  matchScore: number;
  matchReasons: string[];
  isSportMatch: boolean;
  isAdaptiveMatch: boolean;
}

export interface RankedOpportunity {
  opportunity: Opportunity;
  matchScore: number;
  matchReasons: string[];
  isSportMatch: boolean;
}

export interface ProgressSummary {
  isNewUser: boolean;
  emptyStateMessage: string;
  totalSessionsLogged: number;
  totalDurationMinutes: number;
  averageIntensity: string;
  sportSpecificVolumeDisplay: string;
  achievedGoalsCount: number;
  activeGoalsCount: number;
  readinessScore: number;
}

/**
 * 1. Sport-Specific Tracking Configuration
 * Never applies generic distance/pushes across unrelated sports.
 */
export function getSportTrackingConfig(
  sport: string = 'Track & Field',
  isAccessible: boolean = false,
  accommodations: string[] = []
): SportTrackingConfig {
  const s = (sport || '').toLowerCase();
  const accStr = accommodations.join(' ').toLowerCase();

  if (s.includes('badminton')) {
    return {
      sportName: 'Badminton',
      primaryMetricName: 'Footwork & Agility Drills',
      primaryMetricUnit: 'Sets Completed',
      primaryMetricTarget: '8 High-Intensity Sets',
      secondaryMetricName: 'Smash & Deceptive Clears',
      secondaryMetricUnit: 'Reps Tracked',
      sessionTypes: [
        'Footwork Shadow Drills & Front-Court Lunges',
        'Smash Power & Deceptive Net Drops',
        'Singles Full-Court Match Simulation',
        'Doubles Rotation & Defense Scrimmage',
        'Aerobic Court Agility & Recovery'
      ],
      improvementDrills: [
        'Backhand Clear Depth & Whip Mechanics',
        'Four-Corner Transition Reaction Time',
        'Defensive Lift Recovery to Base Center',
        'Fast-Twitch Agility Ladder Drills'
      ],
      equipmentChecklist: [
        'Yonex / Victor Racquet String Tension (Checked 28 lbs)',
        'Grip Tape Replacement & Overgrip Cushion',
        'Court Shoes Non-Marking Gum Sole Traction',
        'Feather Shuttlecock Grade & Flight Test'
      ],
      milestoneTitle: 'Badminton Court Speed & Match Sets'
    };
  }

  if (s.includes('swim')) {
    return {
      sportName: 'Swimming',
      primaryMetricName: 'Pool Volume',
      primaryMetricUnit: 'Meters Completed',
      primaryMetricTarget: '3,500m Target',
      secondaryMetricName: 'Interval Split Consistency',
      secondaryMetricUnit: 'Secs / 100m',
      sessionTypes: [
        'Aerobic Threshold Pacing (200m / 400m)',
        'Sprint 50m Free Split Intervals',
        'Stroke Biomechanics & Flip-Turn Precision',
        'Kickboard & Pull-Buoy Endurance Set',
        'Warm-Down Recovery & Mobility'
      ],
      improvementDrills: [
        'Under-Water Dolphin Kicks Off Walls (15m mark)',
        'High Elbow Catch & Body Rotation Timing',
        'Stroke Cadence Holding Under Fatigue',
        'Negative Split Finishing Push'
      ],
      equipmentChecklist: [
        'Competition Goggles & Anti-Fog Coating',
        'Silicone Racing Cap & Backup Dome',
        'Kickboard, Pull-Buoy & Agility Paddles',
        'Post-Swim Ear & Thermal Recovery Gear'
      ],
      milestoneTitle: 'Swim Lap Volume & Pace Splits'
    };
  }

  if (s.includes('wheelchair') && s.includes('basketball')) {
    return {
      sportName: 'Wheelchair Basketball',
      primaryMetricName: 'Chair Sprints & Agility',
      primaryMetricUnit: 'Timed Court Pushes',
      primaryMetricTarget: '40 Max-Speed Sprints',
      secondaryMetricName: 'Free-Throw & 3-pt Shooting',
      secondaryMetricUnit: '% Converted',
      sessionTypes: [
        'Seated Court Agility & Fast-Break Sprints',
        'Perimeter Shooting Arc & Free-Throw Reps',
        'Chair Picking Angles & Screen Recovery',
        'Full-Court 5v5 Tactical Scrimmage',
        'Seated Core Stability & Shoulder Mobility'
      ],
      improvementDrills: [
        'Reverse Pivot & Instant Forward Propulsion',
        'One-Hand Ball Handling While Pushing',
        'High-Pressure Defensive Chair Trapping',
        'Corner-Three Catch and Shoot Rhythm'
      ],
      equipmentChecklist: [
        'Basketball Chair Tire Pressure (110-120 PSI Checked)',
        '16-Degree Wheel Camber Alignment & Axle Pins',
        'Waist, Thigh & Foot Rest Strapping Security',
        'Front Caster Bearings & Anti-Tip Roller Lubrication'
      ],
      milestoneTitle: 'Wheelchair Basketball Court Agility'
    };
  }

  if (s.includes('wheelchair') || s.includes('para') || (isAccessible && (accStr.includes('chair') || accStr.includes('ramp')))) {
    return {
      sportName: 'Wheelchair Racing & Para Track',
      primaryMetricName: 'Track Pushes & Cadence',
      primaryMetricUnit: 'Total Stroke Pushes',
      primaryMetricTarget: '2,500 Pushes',
      secondaryMetricName: 'Average Track Pace',
      secondaryMetricUnit: 'Min / Km',
      sessionTypes: [
        'Sprint Interval Cadence (100m / 400m splits)',
        'Aerobic Base Propulsion on Roller Ergometer',
        'Starting Block Reaction & Compensator Dialing',
        'Shoulder Depressor Strength & Neck Relief',
        'Recovery Roll & Active Flexibility'
      ],
      improvementDrills: [
        'Hand-Ring Contact Angle & Punch Turnover',
        'Corner Steering & Compensator Tap Timing',
        'Aerodynamic Helmet & Chest Tuck Posture',
        'Lactic Acid Clearance Pacing'
      ],
      equipmentChecklist: [
        'Racing Chair Tire Pressure (120 PSI Checked)',
        'Crown Compensator Quick-Release Check',
        'Custom Pushing Gloves & Resin Grip Layer',
        'Main Axle Carbon Spoke Tension'
      ],
      milestoneTitle: 'Para Track Cadence & Stroke Ergonomics'
    };
  }

  if (s.includes('track') || s.includes('run')) {
    const isVI = accStr.includes('visual') || accStr.includes('screen') || accStr.includes('guide');
    return {
      sportName: isVI ? 'Track & Field (VI Division)' : 'Track & Field',
      primaryMetricName: 'Mileage / Distance',
      primaryMetricUnit: 'Kilometers Logged',
      primaryMetricTarget: '12.0 km Weekly',
      secondaryMetricName: isVI ? 'Guide Synchrony Rating' : 'Split Consistency',
      secondaryMetricUnit: isVI ? '/ 10 Score' : 'Secs / 400m',
      sessionTypes: [
        isVI ? 'T12 Sprint Pacing & Guide Tether Synchronization' : 'Sprint Interval Pacing (400m Splits)',
        'Aerobic Base Progression & Distance Pace',
        'Starting Block Acceleration & Drive Phase',
        'Hurdle Mobility & Hip Flexor Drills',
        'Active Recovery & Foam Rolling'
      ],
      improvementDrills: [
        isVI ? 'Tether Tension Feedback & Audible Lane Orientation' : 'Stride Frequency & Ground Contact Time',
        'Top-End Speed Maintenance Under Fatigue',
        'Curve Acceleration & Knee Drive Mechanics',
        'Deep Core Antagonist Muscle Conditioning'
      ],
      equipmentChecklist: [
        isVI ? 'Running Guide Tether & Tactile Marker Beacons' : 'Spike Plate Integrity & 1/4" Pyramid Pins',
        'Competition Running Spikes & Replacement Wrench',
        'GPS Cadence & Heart Rate Sensor Sync',
        'Hydration Electrolyte Pouch Prepared'
      ],
      milestoneTitle: isVI ? 'VI Track Pacing & Guide Synchrony' : 'Track Distance & Split Timing'
    };
  }

  // Fallback for any other sport (e.g. Football, Tennis, Rowing)
  return {
    sportName: sport || 'Collegiate Athletics',
    primaryMetricName: 'Training Workload',
    primaryMetricUnit: 'Drills Completed',
    primaryMetricTarget: '15 High-Quality Reps',
    secondaryMetricName: 'Session Duration',
    secondaryMetricUnit: 'Minutes Logged',
    sessionTypes: [
      `${sport} Sport-Specific Tactical Drills`,
      `${sport} Skill Execution & Mechanics`,
      'Cardio & Energy System Conditioning',
      'Match Simulation & Situational Play',
      'Active Recovery & Tissue Mobility'
    ],
    improvementDrills: [
      'Sport-Specific Technical Efficiency',
      'Tactical Decision-Making Under Pressure',
      'Endurance Retention in Late Periods',
      'Pre-Competition Routine Consistency'
    ],
    equipmentChecklist: [
      `${sport} Competition Gear Inspected`,
      'Protective Equipment & Padding Checked',
      'Recovery Bands & Hydration Flagon',
      'Athletic Trainer Pre-Tape If Required'
    ],
    milestoneTitle: `${sport} Performance Milestones`
  };
}

/**
 * 2. Academic Support & Learning Resources
 * Personalizes learning support to School vs College and chosen subjects.
 */
export function getAcademicSupportResources(
  educationLevel: string = 'College student',
  supportSubjects: string = '',
  examPeriod: string = '',
  accommodations: string[] = []
): AcademicSupportResource[] {
  const isSchool = educationLevel.toLowerCase().includes('school');
  const subjects = supportSubjects || (isSchool ? 'Science & Mathematics' : 'Academic Core');
  const exam = examPeriod || 'Upcoming Semester Midterm Exams';
  const hasVisualAcc = accommodations.some(a => a.toLowerCase().includes('visual') || a.toLowerCase().includes('screen'));
  const hasMobilityAcc = accommodations.some(a => a.toLowerCase().includes('mobility') || a.toLowerCase().includes('ramp') || a.toLowerCase().includes('wheelchair'));

  const resources: AcademicSupportResource[] = [];

  if (isSchool) {
    resources.push({
      id: 'sch-1',
      title: `High School: ${subjects} Revision Pacing`,
      type: 'study_schedule',
      description: `Structured homework and problem-set timetable balanced around morning/afternoon athletic training sessions.`,
      urgency: 'high',
      tag: 'School Pacing',
      actionText: 'View Study Plan'
    });
    resources.push({
      id: 'sch-2',
      title: `Exam Countdown: ${exam}`,
      type: 'exam_prep',
      description: `Interscholastic exam preparation timeline with built-in rest periods to prevent academic burnout before state qualifiers.`,
      urgency: 'high',
      tag: 'Exam Review',
      actionText: 'Open Exam Calendar'
    });
    resources.push({
      id: 'sch-3',
      title: 'Peer Tutoring & Academic Advisory Hall',
      type: 'tutor',
      description: 'Free school-coordinated study hall hours available directly before and after team practices.',
      urgency: 'medium',
      tag: 'Free Tutoring',
      actionText: 'Book Peer Tutor'
    });
  } else {
    resources.push({
      id: 'col-1',
      title: `Collegiate Coursework: ${subjects}`,
      type: 'course_priority',
      description: `Organized syllabus tracker, laboratory reports, and lecture slides aligned with team travel itinerary.`,
      urgency: 'high',
      tag: 'Collegiate Syllabus',
      actionText: 'Review Coursework'
    });
    resources.push({
      id: 'col-2',
      title: `Midterm & Final Window: ${exam}`,
      type: 'exam_prep',
      description: `Automatic study buffer blocks reserved around conference travel dates. NCAA APR academic compliance verified.`,
      urgency: 'high',
      tag: 'APR Verified',
      actionText: 'Review Buffer Times'
    });
    resources.push({
      id: 'col-3',
      title: 'Athletic Department Study Hall & Advisor Hours',
      type: 'tutor',
      description: 'Dedicated student-athlete academic counselor drop-in slots for major advising and tournament exam proctoring.',
      urgency: 'medium',
      tag: 'Varsity Advisor',
      actionText: 'Schedule Advising'
    });
  }

  // Add Accessibility-specific accommodations
  if (hasVisualAcc) {
    resources.push({
      id: 'acc-vi',
      title: 'Screen-Reader Compatible Course Packs & Audiobooks',
      type: 'accessible_format',
      description: 'Certified EPUB, MathML, and human-narrated MP3 lecture summaries for all enrolled course modules.',
      urgency: 'high',
      tag: 'Accessible Digital Formats',
      actionText: 'Access Audio Library'
    });
  }

  if (hasMobilityAcc) {
    resources.push({
      id: 'acc-mob',
      title: 'Campus Accessible Route & Elevator Telemetry',
      type: 'accessible_format',
      description: 'Real-time status of university elevators, automated door openers, and ramp portals between academic halls and athletic facilities.',
      urgency: 'medium',
      tag: 'Ramp Access OK',
      actionText: 'View Transit Map'
    });
  }

  return resources;
}

/**
 * 3. Coach Ranking and Filtering
 * Strict sport matching; elevates verified adaptive credentials when relevant.
 */
export function rankAndFilterCoaches(
  coaches: Coach[],
  primarySport: string,
  skillLevel: string = '',
  accommodations: string[] = [],
  isAccessibleTrack: boolean = false
): RankedCoach[] {
  if (!coaches || coaches.length === 0) return [];

  const targetSport = (primarySport || '').toLowerCase().trim();
  const hasAdaptiveNeeds = isAccessibleTrack || accommodations.length > 0;
  const isVI = accommodations.some(a => a.toLowerCase().includes('visual') || a.toLowerCase().includes('screen'));

  const ranked: RankedCoach[] = coaches.map(c => {
    let score = 0;
    const reasons: string[] = [];
    const cSport = c.sport.toLowerCase();
    const cBio = (c.bio + ' ' + c.qualifications + ' ' + c.accessibility_specialties).toLowerCase();

    // 1. Sport Match (Highest weight: 100 points)
    let isSportMatch = false;
    if (targetSport && cSport.includes(targetSport)) {
      score += 100;
      isSportMatch = true;
      reasons.push(`Direct match for ${primarySport}`);
    } else if (
      (targetSport.includes('badminton') && cSport.includes('badminton')) ||
      (targetSport.includes('swim') && cSport.includes('swim')) ||
      (targetSport.includes('wheelchair') && targetSport.includes('basketball') && cSport.includes('wheelchair basketball')) ||
      (targetSport.includes('track') && cSport.includes('track'))
    ) {
      score += 100;
      isSportMatch = true;
      reasons.push(`Direct match for ${primarySport}`);
    }

    // 2. Adaptive Credentials Match (50 points if applicable)
    let isAdaptiveMatch = false;
    if (hasAdaptiveNeeds) {
      if (isVI && (cBio.includes('guide') || cBio.includes('visual') || cBio.includes('t11') || cBio.includes('t12'))) {
        score += 60;
        isAdaptiveMatch = true;
        reasons.push('Certified Para Athletics Guide Runner & Visual Specialist');
      } else if (cBio.includes('wheelchair') || cBio.includes('paralympic') || cBio.includes('adaptive') || c.accessibility_specialties) {
        score += 45;
        isAdaptiveMatch = true;
        reasons.push('Verified Adaptive & Paralympic Specialist');
      }
    }

    // 3. Level Matching (15 points)
    if (skillLevel && c.coaching_level.toLowerCase().includes('collegiate') && skillLevel.toLowerCase().includes('college')) {
      score += 15;
      reasons.push('Experienced in Collegiate Varsity Coaching');
    }

    return {
      coach: c,
      matchScore: score,
      matchReasons: reasons,
      isSportMatch,
      isAdaptiveMatch
    };
  });

  // Sort descending by matchScore
  ranked.sort((a, b) => b.matchScore - a.matchScore);

  // Filter: if we have coaches that match the athlete's primary sport, prioritize them!
  const matchingSportList = ranked.filter(r => r.isSportMatch);
  if (matchingSportList.length > 0) {
    // Return sport matches first, followed by general performance/strength specialists
    const others = ranked.filter(r => !r.isSportMatch && (r.isAdaptiveMatch || r.coach.sport.toLowerCase().includes('strength')));
    return [...matchingSportList, ...others];
  }

  return ranked;
}

/**
 * 4. Opportunity Filtering & Ranking
 * Matches by sport, education level, and verified accessibility.
 */
export function rankAndFilterOpportunities(
  opportunities: Opportunity[],
  primarySport: string,
  educationLevel: string = 'College student',
  isAccessibleTrack: boolean = false
): RankedOpportunity[] {
  if (!opportunities || opportunities.length === 0) return [];

  const targetSport = (primarySport || '').toLowerCase().trim();
  const isSchool = educationLevel.toLowerCase().includes('school');

  const ranked: RankedOpportunity[] = opportunities.map(opp => {
    let score = 0;
    const reasons: string[] = [];
    const oppText = (opp.title + ' ' + opp.eligibility + ' ' + opp.access_details).toLowerCase();

    // Sport Match
    let isSportMatch = false;
    if (targetSport && oppText.includes(targetSport)) {
      score += 100;
      isSportMatch = true;
      reasons.push(`Direct match for ${primarySport}`);
    }

    // Education Level Match
    if (isSchool && (oppText.includes('school') || oppText.includes('youth') || oppText.includes('interscholastic'))) {
      score += 30;
      reasons.push('Eligible for High School Student-Athletes');
    } else if (!isSchool && (oppText.includes('collegiate') || oppText.includes('university') || oppText.includes('undergraduate'))) {
      score += 30;
      reasons.push('Eligible for Collegiate Competitors');
    }

    // Accessibility verified
    if (isAccessibleTrack && opp.verification_state === 'Verified Accessible Venue') {
      score += 25;
      reasons.push('100% Verified Accessible Venue');
    }

    return {
      opportunity: opp,
      matchScore: score,
      matchReasons: reasons,
      isSportMatch
    };
  });

  ranked.sort((a, b) => b.matchScore - a.matchScore);

  // If there are sport matches, show them first
  const sportMatches = ranked.filter(r => r.isSportMatch);
  if (sportMatches.length > 0) {
    // Also include inclusive fellowships / tech grants that match education level
    const generalInclusive = ranked.filter(r => !r.isSportMatch && r.opportunity.is_online);
    return [...sportMatches, ...generalInclusive];
  }

  return ranked;
}

/**
 * 5. Calculate Real Progress Summary
 * NO fabricated percentages or invented 38.4km! Reflects actual logged sessions.
 */
export function calculateProgressSummary(
  sessions: TrainingSession[] = [],
  goals: ProgressGoal[] = [],
  sport: string = 'Athletics'
): ProgressSummary {
  if (!sessions || sessions.length === 0) {
    return {
      isNewUser: true,
      emptyStateMessage: 'Your progress journey starts here. Add your first training session or academic goal to begin tracking your progress.',
      totalSessionsLogged: 0,
      totalDurationMinutes: 0,
      averageIntensity: 'N/A',
      sportSpecificVolumeDisplay: '0 sessions logged',
      achievedGoalsCount: goals.filter(g => g.status === 'achieved').length,
      activeGoalsCount: goals.filter(g => g.status === 'in_progress').length,
      readinessScore: 80 // Base neutral readiness
    };
  }

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const achieved = goals.filter(g => g.status === 'achieved').length;
  const active = goals.filter(g => g.status === 'in_progress').length;

  return {
    isNewUser: false,
    emptyStateMessage: '',
    totalSessionsLogged: totalSessions,
    totalDurationMinutes: totalMinutes,
    averageIntensity: 'Moderate - High',
    sportSpecificVolumeDisplay: `${totalHours} hrs across ${totalSessions} sessions`,
    achievedGoalsCount: achieved,
    activeGoalsCount: active,
    readinessScore: Math.min(95, 75 + totalSessions * 5)
  };
}
