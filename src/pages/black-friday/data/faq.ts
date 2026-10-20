import { ACADEMY, GIFTS_SUMMARY, RESERVE_HOURS } from './campaign'

export interface QA {
  q: string
  a: string
}

// Generic answers for every academy; academy facts come from ./academy.ts.
// Offer details the client hasn't confirmed stay as [… — TO CONFIRM].
export const FAQ: QA[] = [
  {
    q: 'How does the Black Friday gift work?',
    a: "Answer two quick questions, open the box and claim your gift with your name, mobile number and email. Then pick the day and time of your first class. The gift is matched to who's training, not left to luck.",
  },
  {
    q: 'What gifts can I unlock?',
    a: GIFTS_SUMMARY,
  },
  {
    q: 'How long is my gift reserved?',
    a: `${RESERVE_HOURS} hours from the moment you open it. The clock doesn't restart if you come back to the page.`,
  },
  {
    q: 'Can I claim more than one gift?',
    a: 'No. There is one gift per mobile number.',
  },
  {
    q: 'How do I use my gift?',
    a: '[How and until when to redeem your gift — TO CONFIRM]',
  },
  {
    q: 'Do I need experience or to be in shape?',
    a: 'No. Classes are designed for all fitness levels and complete beginners.',
  },
  {
    q: 'What age can my child start?',
    a: `Kids start at age ${ACADEMY.kidsMin}. Classes are organized by age group, from ${ACADEMY.kidsAges} for kids to teens and adults.`,
  },
  {
    q: 'Is Jiu-Jitsu safe?',
    a: "Yes. Classes are structured and supervised by experienced instructors, and kids' classes respect each child's age and development.",
  },
  {
    q: 'Where are you?',
    a: `${ACADEMY.address}. Call or text us at ${ACADEMY.phone}.`,
  },
]
