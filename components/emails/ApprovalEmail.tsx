import * as React from 'react';

interface ApprovalEmailProps {
  nombreUsuario: string;
  emailUsuario: string;
  loginUrl: string;
}

export const ApprovalEmail: React.FC<Readonly<ApprovalEmailProps>> = ({
  nombreUsuario,
  emailUsuario,
  loginUrl,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.5', maxWidth: '550px', margin: '0 auto' }}>
    <h2 style={{ color: '#0d9488', fontSize: '18px' }}>¡Acceso Concedido a VetCare!</h2>
    
    <p>Estimado/a <strong>{nombreUsuario}</strong>,</p>
    
    <p>Nos alegra informarle que su solicitud de acceso a la plataforma <strong>VetCare</strong> ha sido aprobada con éxito por el equipo de administración.</p>
    
    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', margin: '20px 0' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#475569' }}>Credenciales de acceso:</p>
      <p style={{ margin: '4px 0' }}><strong>Correo electrónico:</strong> <span style={{ fontFamily: 'monospace' }}>{emailUsuario}</span></p>
      <p style={{ margin: '4px 0' }}><strong>Contraseña:</strong> <em>La clave que asignó durante su registro.</em></p>
    </div>
    
    <p style={{ margin: '24px 0' }}>
      <a href={`${loginUrl}/login`} style={{ backgroundColor: '#0d9488', color: '#white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
        Ingresar al Sistema
      </a>
    </p>
    
    <p style={{ fontSize: '11px', color: '#64748b' }}>
      Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br />
      <a href={`${loginUrl}/login`} style={{ color: '#0d9488' }}>{loginUrl}/login</a>
    </p>
    
    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />
    <p>Atentamente,</p>
    <p><strong>Administración de Accesos</strong><br /><em>VetCare</em></p>
  </div>
);