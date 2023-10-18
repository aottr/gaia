import { format } from 'date-fns';
import { customAlphabet } from 'nanoid';

// Class{1}-SpeciesNanme{6}-Gender-YYMM-{Random-4-6}
export const generateShorkBytesIdentityCode = (classification: string, species: string, sex: string, dayofbirth: Date) => {

    const classCode = classification.charAt(0).toUpperCase();
    const speciesCode = species.split(' ').map(word => word.substring(0, 2).toUpperCase()).join('');
    const sexCode = sex.charAt(0).toUpperCase();
    const dayofbirthCode = format(dayofbirth, 'yyMM');
    const randomCode = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFHJKLMNPQRSTUVWXYZ', 10 - speciesCode.length);
    return `${classCode}-${speciesCode}-${sexCode}-${dayofbirthCode}-${randomCode()}`;
}