import * as React from 'react';

interface RejectionEmailProps {
  nombreUsuario: string;
}

export const RejectionEmail: React.FC<Readonly<RejectionEmailProps>> = ({
  nombreUsuario,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.5', maxWidth: '550px', margin: '0 auto' }}>
    <h2 style={{ color: '#e11d48', fontSize: '18px' }}>Solicitud de acceso denegada</h2>
    
    <p>Estimado/a <strong>{nombreUsuario}</strong>,</p>
    
    <p>Le informamos que su solicitud de ingreso a la plataforma <strong>VetCare</strong> ha sido rechazada debido a que los datos proporcionados no coinciden con los registros del personal activo de la empresa.</p>
    
    <p>Por políticas de seguridad, el acceso a este sistema está estrictamente reservado para colaboradores vigentes.</p>
    
    <p>Si considera que se trata de un error o se incorporó recientemente al equipo, por favor póngase en contacto con el <strong>Administrador del Sistema</strong> o el departamento de <strong>Recursos Humanos</strong> para verificar sus credenciales.</p>
    
    <p>Atentamente,</p>
    <p><strong>Administración de Accesos</strong><br /><em>VetCare</em></p>
  </div>
);