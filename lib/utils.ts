import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const availableColors = [
  {
    name: 'Picasso yellow',
    value: '#FEEA93'
  },
  {
    name: 'Sage green',
    value: '#99A285'
  },
  {
    name: 'Pattens Blue',
    value: '#D2E4F8'
  },
  {
    name: 'Tapestry red',
    value: '#BF6878'
  },
  {
    name: 'Burning Sand orange',
    value: '#D08365'
  },
  {
    name: 'Peach orange',
    value: '#FFCB99'
  },
  {
    name: 'Ce Soir violet',
    value: '#9377A0'
  },
  {
    name: 'Rustic Red',
    value: '#2C090F'
  },
  {
    name: 'Dark green',
    value: '#0F2620'
  },
  {
    name: 'Bay of Many blue',
    value: '#313D65'
  },
  {
    name: 'Shadow brown',
    value: '#856C4E'
  }
]
