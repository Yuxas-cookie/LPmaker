import { motion, AnimatePresence } from 'framer-motion'
import { LOADING_MESSAGES } from '@/constants/loading'

type Props = {
  isLoading: boolean
  loadingStage: number
}

export function LoadingOverlay({ isLoading, loadingStage }: Props) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loading-spinner-container">
            <div className="spinner-ring-outer" />
            <div className="spinner-ring-inner" />
            <div className="spinner-center-dot" />
            <div className="orbital-dot" />
            <div className="orbital-dot" />
            <div className="orbital-dot" />
            <div className="orbital-dot" />
          </div>
          <p className="loading-stage-text" key={loadingStage}>
            {LOADING_MESSAGES[loadingStage]}...
          </p>
          <div className="loading-progress-bar" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
