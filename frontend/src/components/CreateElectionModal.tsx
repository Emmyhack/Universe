import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Users, FileText } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const createElectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  universityCode: z.string().min(1, 'University code is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  eligibilityRoot: z.string().min(1, 'Eligibility root is required'),
  description: z.string().optional(),
});

type CreateElectionForm = z.infer<typeof createElectionSchema>;

interface CreateElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateElectionModal = ({ isOpen, onClose, onSuccess }: CreateElectionModalProps) => {
  const { executeTransaction, getContract } = useWeb3();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateElectionForm>({
    resolver: zodResolver(createElectionSchema),
  });

  const onSubmit = async (data: CreateElectionForm) => {
    try {
      setLoading(true);
      
      const electionFactory = getContract('electionFactory');
      if (!electionFactory) {
        throw new Error('Election factory contract not found');
      }

      const startTime = Math.floor(new Date(data.startTime).getTime() / 1000);
      const endTime = Math.floor(new Date(data.endTime).getTime() / 1000);

      // Mock contract addresses - in real app, these would be fetched
      const verificationMerkleAddress = '0x1234567890123456789012345678901234567890';
      const candidateRegistryAddress = '0x2345678901234567890123456789012345678901';
      const zkVerifierAddress = '0x3456789012345678901234567890123456789012';

      await executeTransaction(
        electionFactory.createElection(
          data.universityCode,
          data.title,
          startTime,
          endTime,
          data.eligibilityRoot,
          verificationMerkleAddress,
          candidateRegistryAddress,
          zkVerifierAddress
        ),
        'Creating election...'
      );

      reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating election:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Election</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="form-label">Election Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g., Student Union President 2024"
                  className="input-field"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* University Code */}
              <div>
                <label className="form-label">University Code</label>
                <input
                  {...register('universityCode')}
                  type="text"
                  placeholder="e.g., UTECH"
                  className="input-field"
                />
                {errors.universityCode && (
                  <p className="text-red-600 text-sm mt-1">{errors.universityCode.message}</p>
                )}
              </div>

              {/* Eligibility Root */}
              <div>
                <label className="form-label">Eligibility Root</label>
                <input
                  {...register('eligibilityRoot')}
                  type="text"
                  placeholder="0x..."
                  className="input-field"
                />
                {errors.eligibilityRoot && (
                  <p className="text-red-600 text-sm mt-1">{errors.eligibilityRoot.message}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="form-label">Start Time</label>
                <div className="relative">
                  <input
                    {...register('startTime')}
                    type="datetime-local"
                    className="input-field"
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.startTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.startTime.message}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="form-label">End Time</label>
                <div className="relative">
                  <input
                    {...register('endTime')}
                    type="datetime-local"
                    className="input-field"
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.endTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.endTime.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Provide additional details about this election..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Important Notes</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• The election will start in the Registration phase</li>
                    <li>• Candidates can be registered during the Registration phase</li>
                    <li>• Voting will begin automatically at the specified start time</li>
                    <li>• The election can be managed through the admin panel</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary inline-flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Create Election</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateElectionModal;