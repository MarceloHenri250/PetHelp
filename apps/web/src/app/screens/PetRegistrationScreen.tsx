import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, PawPrint } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PetRegistrationScreen() {
  const navigate = useNavigate();
  const { user, addPet } = useApp();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      addPet({
        name,
        age,
        breed,
        weight,
        photo: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
        ownerId: user?.id || '',
      });
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
          <h1 className="text-3xl text-foreground mb-2">Add Your Pet</h1>
          <p className="text-muted-foreground">Tell us about your furry friend</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center border-4 border-border">
              <Camera className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="petName" className="block text-foreground mb-2">
              Pet Name
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
            <label htmlFor="age" className="block text-foreground mb-2">
              Age
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
              Breed
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

          <div className="mb-6">
            <label htmlFor="weight" className="block text-foreground mb-2">
              Weight
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Pet'}
          </button>
        </form>
      </div>
    </div>
  );
}
