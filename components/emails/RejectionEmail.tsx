import * as React from 'react';

interface RejectionEmailProps {
  nombreUsuario: string;
}

export const RejectionEmail: React.FC<Readonly<RejectionEmailProps>> = ({
  nombreUsuario,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
    <h2 style={{ color: '#e11d48' }}>Actualización sobre su solicitud de acceso a VetCare</h2>
    <p>Estimado/a <strong>{nombreUsuario}</strong>,</p>
    <p>Esperamos que se encuentre muy bien.</p>
    <p>Le escribimos para informarle sobre el estado de la solicitud de acceso que registró recientemente en nuestra plataforma de gestión veterinaria <strong>VetCare</strong>.</p>
    <p>Tras la revisión obligatoria por parte del equipo de administración, lamentamos informarle que su solicitud de acceso al sistema ha sido <strong>denegada</strong> en esta ocasión, debido a que los datos proporcionados no coinciden con los registros actuales del personal activo o autorizado de la empresa.</p>
    <p>Por motivos de seguridad de la información y protección de los registros clínicos de nuestros pacientes, el acceso a este ecosistema está estrictamente reservado para los colaboradores vigentes de la institución.</p>
    <p>Si considera que esto se trata de un error o si se ha incorporado recientemente al equipo, le solicitamos que se ponga en contacto directo con el <strong>Departamento de Recursos Humanos</strong> o con el <strong>Administrador del Sistema</strong> para validar sus credenciales y coordinar una nueva alta en la plataforma.</p>
    <p>Agradecemos sinceramente su comprensión y el tiempo dedicado al proceso.</p>
    <br />
    <p>Atentamente,</p>
    <p><strong>Equipo de Seguridad y Administración de Accesos</strong><br /><em>VetCare – Ecosistema de Gestión Veterinaria</em></p>
  </div>
);