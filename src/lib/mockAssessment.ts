import { PhotoAssessment, BoundingBox, DamageItem } from '../types/assessment';

const damageTypes = [
  'Panel damage',
  'Scratch',
  'Dent',
  'Bumper damage',
  'Paint damage',
  'Cracked light',
  'Mirror damage',
  'Windshield crack',
  'Tire damage',
  'Rim damage'
];

const vehicleLocations = [
  'Front bumper',
  'Rear bumper',
  'Driver side door',
  'Passenger side door',
  'Driver side wheel well',
  'Passenger side wheel well',
  'Hood',
  'Roof',
  'Trunk',
  'Front fender',
  'Rear fender',
  'Headlight',
  'Taillight',
  'Side mirror'
];

function generateRandomBoundingBoxes(count: number): BoundingBox[] {
  const boxes: BoundingBox[] = [];

  for (let i = 0; i < count; i++) {
    boxes.push({
      id: `bbox-${i}`,
      x: Math.random() * 60 + 10,
      y: Math.random() * 60 + 10,
      width: Math.random() * 20 + 10,
      height: Math.random() * 20 + 10,
      label: damageTypes[Math.floor(Math.random() * damageTypes.length)]
    });
  }

  return boxes;
}

function generateRandomDamages(count: number): DamageItem[] {
  const damages: DamageItem[] = [];
  const usedLocations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let location = vehicleLocations[Math.floor(Math.random() * vehicleLocations.length)];

    while (usedLocations.has(location) && usedLocations.size < vehicleLocations.length) {
      location = vehicleLocations[Math.floor(Math.random() * vehicleLocations.length)];
    }

    usedLocations.add(location);

    damages.push({
      id: `damage-${i}`,
      location,
      damage: damageTypes[Math.floor(Math.random() * damageTypes.length)],
      estimatedCost: Math.floor(Math.random() * 2000) + 200
    });
  }

  return damages;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateMockAssessment(photos: File[]): Promise<PhotoAssessment[]> {
  const assessments = await Promise.all(
    photos.map(async (photo, index) => {
      const damageCount = Math.floor(Math.random() * 3) + 2;
      const photoUrl = await fileToBase64(photo);

      return {
        photoIndex: index,
        photoUrl,
        boundingBoxes: generateRandomBoundingBoxes(damageCount),
        damages: generateRandomDamages(damageCount),
        agentNotes: ''
      };
    })
  );

  return assessments;
}
