import { CandidateProfile } from '@/types';

// Mock IPFS data for demonstration purposes
const MOCK_CANDIDATE_PROFILES: Record<string, CandidateProfile> = {
  'QmCandidate1InfoHash': {
    name: 'Sarah Johnson',
    photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE4IiBmaWxsPSIjOUIzQkY2Ii8+CjxwYXRoIGQ9Ik0yNSA4NUMyNSA3MC44NTc5IDM1Ljg1NzkgNjAgNTAgNjBDNjQuMTQyMSA2MCA3NSA3MC44NTc5IDc1IDg1SDF9IiBmaWxsPSIjOUIzQkY2Ii8+Cjwvc3ZnPgo=',
    manifesto: 'As your student body president, I will focus on creating a more inclusive campus environment where every voice is heard. My priority is to bridge the gap between students and administration while ensuring our concerns are addressed promptly and effectively.',
    platform: [
      'Improve campus mental health resources',
      'Extend library hours during finals week',
      'Create more affordable dining options',
      'Establish better career counseling services',
      'Increase student parking availability'
    ],
    experience: 'Former Student Council Vice President, Campus Activities Board Member for 2 years',
    contact: 'sarah.johnson@university.edu',
    university: 'State University',
    studentId: 'SU2021001',
    socialMedia: {
      twitter: '@sarahj_student',
      instagram: '@sarah_johnson_campaign',
      linkedin: 'sarah-johnson-student'
    },
    achievements: [
      'Dean\'s List for 3 consecutive semesters',
      'Organized successful campus sustainability fair',
      'Led volunteer program for local food bank'
    ]
  },
  'QmCandidate2InfoHash': {
    name: 'Michael Chen',
    photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE4IiBmaWxsPSIjMTA0OEY2Ii8+CjxwYXRoIGQ9Ik0yNSA4NUMyNSA3MC44NTc5IDM1Ljg1NzkgNjAgNTAgNjBDNjQuMTQyMSA2MCA3NSA3MC44NTc5IDc1IDg1SDF9IiBmaWxsPSIjMTA0OEY2Ii8+Cjwvc3ZnPgo=',
    manifesto: 'Innovation and technology should drive our campus forward. I believe in leveraging digital solutions to streamline student services and create new opportunities for academic and professional growth.',
    platform: [
      'Digitize student service processes',
      'Create tech startup incubator on campus',
      'Improve campus WiFi infrastructure',
      'Launch peer tutoring app platform',
      'Establish coding bootcamp programs'
    ],
    experience: 'Computer Science Student Association President, Hackathon Organizer',
    contact: 'michael.chen@university.edu',
    university: 'State University',
    studentId: 'SU2021042',
    socialMedia: {
      twitter: '@mikechen_tech',
      linkedin: 'michael-chen-cs'
    },
    achievements: [
      'Winner of 3 university hackathons',
      'Published research in computer vision',
      'Created campus food delivery app'
    ]
  },
  'QmCandidate3InfoHash': {
    name: 'Emma Rodriguez',
    photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE4IiBmaWxsPSIjMDVBMzREIi8+CjxwYXRoIGQ9Ik0yNSA4NUMyNSA3MC44NTc5IDM1Ljg1NzkgNjAgNTAgNjBDNjQuMTQyMSA2MCA3NSA3MC44NTc5IDc1IDg1SDF9IiBmaWxsPSIjMDVBMzREIi8+Cjwvc3ZnPgo=',
    manifesto: 'Student advocacy and social justice are at the heart of my campaign. I will work tirelessly to ensure fair policies, equal opportunities, and a supportive environment for all students, especially those from underrepresented backgrounds.',
    platform: [
      'Expand financial aid accessibility',
      'Create diversity and inclusion programs',
      'Establish food pantry for students in need',
      'Improve accessibility for disabled students',
      'Launch campus safety initiatives'
    ],
    experience: 'Student Rights Advocate, Minority Student Union Vice President',
    contact: 'emma.rodriguez@university.edu',
    university: 'State University',
    studentId: 'SU2020785',
    socialMedia: {
      twitter: '@emma_advocates',
      instagram: '@emma_for_students',
      linkedin: 'emma-rodriguez-advocate'
    },
    achievements: [
      'Successfully lobbied for tuition freeze',
      'Organized campus social justice summit',
      'Established emergency fund for students'
    ]
  }
};

/**
 * Simulates fetching candidate profile data from IPFS
 * In a real implementation, this would make actual IPFS API calls
 */
export const fetchCandidateProfile = async (ipfsHash: string): Promise<CandidateProfile> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  const profile = MOCK_CANDIDATE_PROFILES[ipfsHash];
  
  if (!profile) {
    throw new Error(`Profile not found for IPFS hash: ${ipfsHash}`);
  }
  
  return profile;
};

/**
 * Batch fetch multiple candidate profiles
 */
export const fetchMultipleCandidateProfiles = async (ipfsHashes: string[]): Promise<Record<string, CandidateProfile | null>> => {
  const results: Record<string, CandidateProfile | null> = {};
  
  await Promise.all(
    ipfsHashes.map(async (hash) => {
      try {
        results[hash] = await fetchCandidateProfile(hash);
      } catch (error) {
        console.error(`Failed to fetch profile for ${hash}:`, error);
        results[hash] = null;
      }
    })
  );
  
  return results;
};

/**
 * Helper function to get a placeholder profile for failed loads
 */
export const getPlaceholderProfile = (candidateAddress: string): CandidateProfile => {
  return {
    name: `Candidate ${candidateAddress.slice(0, 6)}...${candidateAddress.slice(-4)}`,
    manifesto: 'Profile information could not be loaded.',
    platform: ['Platform information unavailable'],
    experience: 'Information not available'
  };
};

/**
 * Validate if an IPFS hash is properly formatted
 */
export const isValidIpfsHash = (hash: string): boolean => {
  // Basic IPFS hash validation (QmHash format)
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
};