import { Component } from 'react'

// Catches render-time errors anywhere in the tree so one bad row of data
// doesn't white-screen the whole app for every visitor.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black/60 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="font-chalk text-3xl text-white">VibeBar</span>
          <p className="font-menu text-sm text-white/70 max-w-xs">
            Нешто тргна наопаку. Обидете се повторно.
            <br />
            <span className="text-white/40">Something went wrong. Please try again.</span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="font-menu text-sm px-4 py-2 rounded-full border border-white/40 text-white hover:bg-white/10 transition-colors"
          >
            Освежи / Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
