import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface CertificateSubmissionProps {
  courseId: string;
  courseTitle: string;
  onSuccess?: () => void;
}

export default function CertificateSubmission({ courseId, courseTitle, onSuccess }: CertificateSubmissionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    issueDate: new Date(),
    fileUrl: '',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setFormData({
      title: '',
      provider: '',
      issueDate: new Date(),
      fileUrl: '',
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Certificate title is required');
      return false;
    }
    if (!formData.provider.trim()) {
      setError('Provider is required');
      return false;
    }
    if (!formData.fileUrl.trim()) {
      setError('Certificate URL is required');
      return false;
    }
    if (!formData.fileUrl.startsWith('http://') && !formData.fileUrl.startsWith('https://')) {
      setError('Certificate URL must start with http:// or https://');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting certificate:', {
        ...formData,
        courseId,
        issueDate: formData.issueDate.toISOString(),
      });

      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courseId,
          issueDate: formData.issueDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit certificate');
      }

      console.log('Certificate submitted successfully:', data);
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting certificate:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mt: 2 }}
      >
        Submit Certificate
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Certificate for {courseTitle}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Certificate Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
                error={!!error && !formData.title.trim()}
                helperText={!formData.title.trim() ? 'Certificate title is required' : ''}
              />
              <TextField
                label="Provider (e.g., Coursera, Udemy)"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                required
                fullWidth
                error={!!error && !formData.provider.trim()}
                helperText={!formData.provider.trim() ? 'Provider is required' : ''}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Issue Date"
                  value={formData.issueDate}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setFormData({ ...formData, issueDate: date });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <TextField
                label="Certificate URL"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                required
                fullWidth
                error={!!error && (!formData.fileUrl.trim() || !formData.fileUrl.startsWith('http'))}
                helperText={
                  !formData.fileUrl.trim()
                    ? 'Certificate URL is required'
                    : !formData.fileUrl.startsWith('http')
                    ? 'URL must start with http:// or https://'
                    : 'Enter the URL where your certificate can be viewed'
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
} 