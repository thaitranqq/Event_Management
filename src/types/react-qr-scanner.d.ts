declare module 'react-qr-scanner' {
  import * as React from 'react'

  export interface ReactQrScannerProps {
    onScan?: (data: any) => void
    onError?: (err: any) => void
    delay?: number
    facingMode?: string
    style?: React.CSSProperties
  }

  const ReactQrScanner: React.ComponentType<ReactQrScannerProps>
  export default ReactQrScanner
}
