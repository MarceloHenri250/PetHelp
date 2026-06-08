// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Camera, PawPrint } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PetRegistrationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentPet, addPet, updatePet } = useApp();
  const isEditing = location.state?.mode === 'edit' && !!currentPet;
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState('');
  const [allergiesStr, setAllergiesStr] = useState('');
  const [conditionsStr, setConditionsStr] = useState('');
  const [initialHealthHistory, setInitialHealthHistory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing || !currentPet) {
      setName('');
      setSpecies('');
      setAge('');
      setBreed('');
      setWeight('');
      setPhoto('');
      setAllergiesStr('');
      setConditionsStr('');
      setInitialHealthHistory('');
      return;
    }

    setName(currentPet.name);
    setSpecies(currentPet.species || '');
    setAge(currentPet.age);
    setBreed(currentPet.breed);
    setWeight(currentPet.weight);
    setPhoto(currentPet.photo || '');
    setAllergiesStr(currentPet.allergies ? currentPet.allergies.join(', ') : '');
    setConditionsStr(currentPet.conditions ? currentPet.conditions.join(', ') : '');
    setInitialHealthHistory(currentPet.initialHealthHistory || '');
  }, [isEditing, currentPet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const petPayload = {
        name,
        species: species || undefined,
        age,
        breed,
        weight,
        photo: photo || undefined,
        allergies: allergiesStr ? allergiesStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        conditions: conditionsStr ? conditionsStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        initialHealthHistory: initialHealthHistory || undefined,
      };

      if (isEditing && currentPet) {
        await updatePet(currentPet.id, petPayload);
      } else {
        await addPet({
          ...petPayload,
          ownerId: user?.id || '',
        });
      }
      navigate('/owner-dashboard');
    } catch (error) {
      console.error('Pet registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">{isEditing ? 'Edit Pet' : 'Add Your Pet'}</h1>
          <p className="text-muted-foreground">{isEditing ? 'Update the pet information' : 'Tell us about your furry friend'}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 bg-muted rounded-full overflow-hidden flex items-center justify-center border-4 border-border mb-4">
              {photo ? (
                <img src={photo} alt="Pet" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="w-full">
              <label htmlFor="photo" className="block text-foreground mb-2 text-center text-sm font-medium">
                Photo (optional)
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPhoto(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground text-center file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="petName" className="block text-foreground mb-2">
              Pet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="petName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
              placeholder="Max"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="species" className="block text-foreground mb-2">
              Species
            </label>
            <input
              type="text"
              id="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
              placeholder="Dog, Cat, etc."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="age" className="block text-foreground mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
              placeholder="3 years"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="breed" className="block text-foreground mb-2">
              Breed <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
              placeholder="Golden Retriever"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="weight" className="block text-foreground mb-2">
              Weight <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
              placeholder="25 kg"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="allergies" className="block text-foreground mb-2">
              Allergies (comma separated)
            </label>
            <input
              type="text"
              id="allergies"
              value={allergiesStr}
              onChange={(e) => setAllergiesStr(e.target.value)}
              className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
              placeholder="e.g. Peanuts, Dust"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="conditions" className="block text-foreground mb-2">
              Conditions (comma separated)
            </label>
            <input
              type="text"
              id="conditions"
              value={conditionsStr}
              onChange={(e) => setConditionsStr(e.target.value)}
              className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
              placeholder="e.g. Diabetes, Arthritis"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Pet' : 'Save Pet'}
          </button>
        </form>
      </div>
    </div>
  );
}
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Pet' : 'Save Pet'}
          </button>
        </form>
      </div>
    </div>
  );
}
abled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Pet' : 'Save Pet'}
          </button>
        </form>
      </div>
    </div>
  );
}
