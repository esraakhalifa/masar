"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface RequirementGateProps {
  children: ReactNode;
}

export default function RequirementGate({ children }: RequirementGateProps) {
  const { data: session, status } = useSession();
  const [checking, setChecking] = useState(true);
  const [incomplete, setIncomplete] = useState(false);

  useEffect(() => {
    const runChecks = async () => {
      if (!session?.user?.id) {
        setChecking(false);
        return;
      }

      try {
        // 1. Career preference industry check
        const prefRes = await fetch(`/api/users/${session.user.id}/career-preferences`);
        console.log("========Career Preference Check=========");
        console.log(prefRes);
        if (!prefRes.ok) {
          console.log("========Career Preference Check Failed  1  =========");
          setIncomplete(true);
          setChecking(false);
          return;
        }
        const pref = await prefRes.json();
        if (!pref || !pref.industry) {
          console.log("========Career Preference Check Failed 2  =========");
          setIncomplete(true);
          setChecking(false);
          return;
        }

        // 2. Payment validity check (periodEnd BEFORE now is valid)
        const payRes = await fetch(`/api/users/${session.user.id}/payments`);
        console.log("========Payment Check=========");
        console.log(payRes);
        if (!payRes.ok) {
          console.log("========Payment Check Failed 1  =========");
          setIncomplete(true);
          setChecking(false);
          return;
        }
        const payments = await payRes.json();
        console.log("========Payments=========");
        console.log(payments);
        const now = new Date();
        const validPayment = Array.isArray(payments) && payments.some((p: any) => {
            console.log("Period End: ", p.periodEnd);
            console.log("Period Start: ", p.periodStart);
          const endDate = new Date(p.periodEnd || p.period_end);
          console.log("End Date: ", endDate);
          console.log("Now: ", now);
          return  now <= endDate;
        });
        console.log("========Valid Payment=========");
        console.log(validPayment);
        if (!validPayment) {
          console.log("========Payment Check Failed 2  =========");
          setIncomplete(true);
          setChecking(false);
          return;
        }
        console.log("========Payment Check Passed=========");
        // all good
        setIncomplete(false);
        setChecking(false);
      } catch (e) {
        console.log("========Error=========");
        console.log(e);
        setIncomplete(true);
        setChecking(false);
      }
    };

    if (status !== 'loading') runChecks();
  }, [status, session]);

  if (status === 'loading' || checking) {
    return (
      <Box className="flex items-center justify-center min-h-[60vh]">
        <CircularProgress className="text-teal-500" />
      </Box>
    );
  }

  if (incomplete) {
    return (
      <Box className="flex items-center justify-center min-h-[60vh] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <Alert
            icon={<WarningAmberIcon sx={{ fontSize: 40 }} />}
            severity="warning"
            sx={{
              background: 'linear-gradient(135deg, #fff7e6 0%, #ffedd5 100%)',
              borderRadius: '20px',
              padding: '3rem 4rem',
              boxShadow: '0 10px 30px rgba(252, 146, 0, 0.25)',
              textAlign: 'center',
              maxWidth: { xs: '100%', md: 600 },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#c05621', mb: 1 }}>
              Action Required
            </Typography>
            <Typography variant="body1" sx={{ color: '#92400e' }}>
              Please complete your career information and payment to unlock your personalized content.
            </Typography>

            <Box mt={4} display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                color="warning"
                startIcon={<CreditCardOffIcon />}
                href="/payment"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  boxShadow: '0 4px 12px rgba(252, 146, 0, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(252, 146, 0, 0.4)',
                  },
                }}
              >
                Go to Payment
              </Button>
              <Button
                variant="outlined"
                color="warning"
                href="/"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 },
                }}
              >
                Home
              </Button>
            </Box>
          </Alert>
        </motion.div>
      </Box>
    );
  }

  return <>{children}</>;
} 