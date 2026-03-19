export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      gap: '1rem'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>BookLeaf Support Portal</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>
        A production-ready platform for authors and administrators to manage their publishing experience.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/login" style={{ 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          padding: '0.75rem 1.5rem', 
          borderRadius: 'var(--radius)',
          fontWeight: '600'
        }}>
          Get Started
        </a>
      </div>
    </main>
  );
}
