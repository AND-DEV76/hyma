/**
 * Utilidad de Triaje y Clasificación de Signos Vitales para Clínica Médica - HYMA
 * 
 * Convención de Colores:
 * - 🔴 ROJO (CRÍTICO / ALTO): Desviación superior que pone en riesgo la vida.
 * - 🔵 AZUL (CRÍTICO / BAJO): Desviación inferior severa (hipotermia, choque, bradicardia severa).
 * - 🟡 AMARILLO / NARANJA (ALERTA / ANORMAL): Fuera de rango normal sin riesgo inminente.
 * - 🟢 / ⚪ NORMAL: Parámetros dentro de rango normal.
 */

// 1. TEMPERATURA (°C)
export function evaluarTemperatura(temperatura) {
  if (temperatura === null || temperatura === undefined || temperatura === '' || isNaN(temperatura)) return null;
  const val = parseFloat(temperatura);

  if (val < 35.0) {
    return { estado: 'AZUL', label: 'Hipotermia (<35°C)', tipo: 'Bajo Crítico' };
  }
  if (val >= 39.0) {
    return { estado: 'ROJO', label: 'Fiebre Alta (≥39°C)', tipo: 'Alto Crítico' };
  }
  if (val >= 37.6 && val <= 38.9) {
    return { estado: 'AMARILLO', label: 'Alerta (37.6-38.9°C)', tipo: 'Alerta Leve' };
  }
  return { estado: 'NORMAL', label: 'Normal', tipo: 'Normal' };
}

// 2. PRESIÓN ARTERIAL (Sistólica / Diastólica mmHg, ej. "120/80")
export function evaluarPresionArterial(presionArterial) {
  if (!presionArterial || typeof presionArterial !== 'string' || !presionArterial.includes('/')) return null;
  const partes = presionArterial.split('/');
  const sistolica = parseFloat(partes[0].trim());
  const diastolica = parseFloat(partes[1].trim());

  if (isNaN(sistolica) || isNaN(diastolica)) return null;

  // Azul (< 90/60 mmHg: sistólica < 90 o diastólica < 60)
  if (sistolica < 90 || diastolica < 60) {
    return { estado: 'AZUL', label: 'Hipotensión (<90/60)', tipo: 'Bajo Crítico' };
  }
  // Rojo (≥ 140/90 mmHg o ≥ 180/120: sistólica >= 140 o diastólica >= 90)
  if (sistolica >= 140 || diastolica >= 90) {
    return { estado: 'ROJO', label: 'Hipertensión (≥140/90)', tipo: 'Alto Crítico' };
  }
  // Amarillo (130/85 - 139/89 mmHg: sistólica 130-139 o diastólica 85-89)
  if ((sistolica >= 130 && sistolica <= 139) || (diastolica >= 85 && diastolica <= 89)) {
    return { estado: 'AMARILLO', label: 'Prehipertensión (130/85-139/89)', tipo: 'Alerta Leve' };
  }
  return { estado: 'NORMAL', label: 'Normal', tipo: 'Normal' };
}

// 3. FRECUENCIA CARDÍACA (lpm)
export function evaluarFrecuenciaCardiaca(fc) {
  if (fc === null || fc === undefined || fc === '' || isNaN(fc)) return null;
  const val = parseFloat(fc);

  if (val < 50) {
    return { estado: 'AZUL', label: 'Bradicardia (<50 lpm)', tipo: 'Bajo Crítico' };
  }
  if (val > 120) {
    return { estado: 'ROJO', label: 'Taquicardia (>120 lpm)', tipo: 'Alto Crítico' };
  }
  if (val >= 101 && val <= 120) {
    return { estado: 'AMARILLO', label: 'Alerta (101-120 lpm)', tipo: 'Alerta Leve' };
  }
  return { estado: 'NORMAL', label: 'Normal', tipo: 'Normal' };
}

// 4. FRECUENCIA RESPIRATORIA (rpm)
export function evaluarFrecuenciaRespiratoria(fr) {
  if (fr === null || fr === undefined || fr === '' || isNaN(fr)) return null;
  const val = parseFloat(fr);

  if (val < 10) {
    return { estado: 'AZUL', label: 'Bradipnea (<10 rpm)', tipo: 'Bajo Crítico' };
  }
  if (val >= 25) {
    return { estado: 'ROJO', label: 'Taquipnea (≥25 rpm)', tipo: 'Alto Crítico' };
  }
  if (val >= 21 && val <= 24) {
    return { estado: 'AMARILLO', label: 'Alerta (21-24 rpm)', tipo: 'Alerta Leve' };
  }
  return { estado: 'NORMAL', label: 'Normal', tipo: 'Normal' };
}

// 5. SATURACIÓN DE OXÍGENO (%)
export function evaluarSaturacionOxigeno(sat) {
  if (sat === null || sat === undefined || sat === '' || isNaN(sat)) return null;
  const val = parseFloat(sat);

  if (val < 90) {
    return { estado: 'AZUL', label: 'Hipoxia Severa (<90%)', tipo: 'Bajo Crítico' };
  }
  if (val >= 90 && val <= 94) {
    return { estado: 'AMARILLO', label: 'Hipoxia Leve (90-94%)', tipo: 'Alerta Leve' };
  }
  return { estado: 'NORMAL', label: 'Normal (≥95%)', tipo: 'Normal' };
}

// 6. GLICEMIA (mg/dL)
export function evaluarGlicemia(gli) {
  if (gli === null || gli === undefined || gli === '' || isNaN(gli)) return null;
  const val = parseFloat(gli);

  if (val < 60) {
    return { estado: 'AZUL', label: 'Hipoglicemia (<60 mg/dL)', tipo: 'Bajo Crítico' };
  }
  if (val > 200) {
    return { estado: 'ROJO', label: 'Hiperglicemia (>200 mg/dL)', tipo: 'Alto Crítico' };
  }
  if (val >= 100 && val <= 200) {
    return { estado: 'AMARILLO', label: 'Glicemia Elevada (100-200 mg/dL)', tipo: 'Alerta Leve' };
  }
  return { estado: 'NORMAL', label: 'Normal (60-99 mg/dL)', tipo: 'Normal' };
}

/**
 * Evalúa todos los signos vitales registrados de un paciente y genera
 * la prioridad general (Rojo, Amarillo, Normal o Sin Registros) y el desglose de cada signo.
 */
export function evaluarTriajePaciente(signos) {
  if (!signos) {
    return {
      estadoGeneral: 'SIN_REGISTRO',
      tieneSignos: false,
      badge: {
        text: 'SIN PRECONSULTA',
        color: '#64748b',
        bg: '#f1f5f9',
        border: '#cbd5e1',
        dot: '#94a3b8'
      },
      alertas: [],
      chips: []
    };
  }

  const chips = [];
  const alertasRojas = [];
  const alertasAzules = [];
  const alertasLeves = [];

  // 1. Temperatura
  if (signos.temperatura !== null && signos.temperatura !== undefined && signos.temperatura !== '') {
    const res = evaluarTemperatura(signos.temperatura);
    if (res) {
      chips.push({
        sigla: 'TEMP',
        nombre: 'Temperatura',
        valor: `${parseFloat(signos.temperatura).toFixed(1)}°C`,
        ...res
      });
      if (res.estado === 'ROJO') {
        alertasRojas.push({ signo: 'Temperatura', valor: `${signos.temperatura}°C`, ...res });
      } else if (res.estado === 'AZUL') {
        alertasAzules.push({ signo: 'Temperatura', valor: `${signos.temperatura}°C`, ...res });
      } else if (res.estado === 'AMARILLO') {
        alertasLeves.push({ signo: 'Temperatura', valor: `${signos.temperatura}°C`, ...res });
      }
    }
  }

  // 2. Presión Arterial
  if (signos.presionArterial) {
    const res = evaluarPresionArterial(signos.presionArterial);
    if (res) {
      chips.push({
        sigla: 'P.A.',
        nombre: 'Presión Arterial',
        valor: `${signos.presionArterial} mmHg`,
        ...res
      });
      if (res.estado === 'ROJO') {
        alertasRojas.push({ signo: 'Presión Arterial', valor: signos.presionArterial, ...res });
      } else if (res.estado === 'AZUL') {
        alertasAzules.push({ signo: 'Presión Arterial', valor: signos.presionArterial, ...res });
      } else if (res.estado === 'AMARILLO') {
        alertasLeves.push({ signo: 'Presión Arterial', valor: signos.presionArterial, ...res });
      }
    }
  }

  // 3. Frecuencia Cardíaca
  if (signos.frecuenciaCardiaca !== null && signos.frecuenciaCardiaca !== undefined && signos.frecuenciaCardiaca !== '') {
    const res = evaluarFrecuenciaCardiaca(signos.frecuenciaCardiaca);
    if (res) {
      chips.push({
        sigla: 'F.C.',
        nombre: 'Frecuencia Cardíaca',
        valor: `${signos.frecuenciaCardiaca} lpm`,
        ...res
      });
      if (res.estado === 'ROJO') {
        alertasRojas.push({ signo: 'Frecuencia Cardíaca', valor: `${signos.frecuenciaCardiaca} lpm`, ...res });
      } else if (res.estado === 'AZUL') {
        alertasAzules.push({ signo: 'Frecuencia Cardíaca', valor: `${signos.frecuenciaCardiaca} lpm`, ...res });
      } else if (res.estado === 'AMARILLO') {
        alertasLeves.push({ signo: 'Frecuencia Cardíaca', valor: `${signos.frecuenciaCardiaca} lpm`, ...res });
      }
    }
  }

  // 4. Frecuencia Respiratoria
  if (signos.frecuenciaRespiratoria !== null && signos.frecuenciaRespiratoria !== undefined && signos.frecuenciaRespiratoria !== '') {
    const res = evaluarFrecuenciaRespiratoria(signos.frecuenciaRespiratoria);
    if (res) {
      chips.push({
        sigla: 'F.R.',
        nombre: 'Frecuencia Respiratoria',
        valor: `${signos.frecuenciaRespiratoria} rpm`,
        ...res
      });
      if (res.estado === 'ROJO') {
        alertasRojas.push({ signo: 'Frecuencia Respiratoria', valor: `${signos.frecuenciaRespiratoria} rpm`, ...res });
      } else if (res.estado === 'AZUL') {
        alertasAzules.push({ signo: 'Frecuencia Respiratoria', valor: `${signos.frecuenciaRespiratoria} rpm`, ...res });
      } else if (res.estado === 'AMARILLO') {
        alertasLeves.push({ signo: 'Frecuencia Respiratoria', valor: `${signos.frecuenciaRespiratoria} rpm`, ...res });
      }
    }
  }

  // 5. Saturación Oxígeno
  if (signos.saturacionOxigeno !== null && signos.saturacionOxigeno !== undefined && signos.saturacionOxigeno !== '') {
    const res = evaluarSaturacionOxigeno(signos.saturacionOxigeno);
    if (res) {
      chips.push({
        sigla: 'Sat.O₂',
        nombre: 'Saturación Oxígeno',
        valor: `${parseFloat(signos.saturacionOxigeno).toFixed(0)}%`,
        ...res
      });
      if (res.estado === 'ROJO') {
        alertasRojas.push({ signo: 'Saturación O₂', valor: `${signos.saturacionOxigeno}%`, ...res });
      } else if (res.estado === 'AZUL') {
        alertasAzules.push({ signo: 'Saturación O₂', valor: `${signos.saturacionOxigeno}%`, ...res });
      } else if (res.estado === 'AMARILLO') {
        alertasLeves.push({ signo: 'Saturación O₂', valor: `${signos.saturacionOxigeno}%`, ...res });
      }
    }
  }

  // 6. Glicemia
  if (signos.glicemia !== null && signos.glicemia !== undefined && signos.glicemia !== '') {
    const res = evaluarGlicemia(signos.glicemia);
    if (res) {
      chips.push({
        sigla: 'GLIC.',
        nombre: 'Glicemia',
        valor: `${parseFloat(signos.glicemia).toFixed(0)} mg/dL`,
        ...res
      });
      if (res.estado === 'ROJO') {
        alertasRojas.push({ signo: 'Glicemia', valor: `${signos.glicemia} mg/dL`, ...res });
      } else if (res.estado === 'AZUL') {
        alertasAzules.push({ signo: 'Glicemia', valor: `${signos.glicemia} mg/dL`, ...res });
      } else if (res.estado === 'AMARILLO') {
        alertasLeves.push({ signo: 'Glicemia', valor: `${signos.glicemia} mg/dL`, ...res });
      }
    }
  }

  // Si no hay signos registrados
  if (chips.length === 0) {
    return {
      estadoGeneral: 'SIN_REGISTRO',
      tieneSignos: false,
      badge: {
        text: 'SIN PRECONSULTA',
        color: '#64748b',
        bg: '#f1f5f9',
        border: '#cbd5e1',
        dot: '#94a3b8'
      },
      alertas: [],
      chips: []
    };
  }

  const todasAlertasCriticas = [...alertasRojas, ...alertasAzules];

  // 1. Crítico Mixto (tiene signos tanto en Rojo como en Azul)
  if (alertasRojas.length > 0 && alertasAzules.length > 0) {
    return {
      estadoGeneral: 'ROJO',
      tieneSignos: true,
      badge: {
        text: 'CRÍTICO MIXTO',
        color: '#991b1b',
        bg: '#fee2e2',
        border: '#fca5a5',
        dot: '#dc2626'
      },
      alertas: todasAlertasCriticas,
      chips
    };
  }

  // 2. Alto Crítico (Rojo)
  if (alertasRojas.length > 0) {
    return {
      estadoGeneral: 'ROJO',
      tieneSignos: true,
      badge: {
        text: 'CRÍTICO ALTO',
        color: '#991b1b',
        bg: '#fee2e2',
        border: '#fca5a5',
        dot: '#dc2626'
      },
      alertas: alertasRojas,
      chips
    };
  }

  // 3. Bajo Crítico (Azul)
  if (alertasAzules.length > 0) {
    return {
      estadoGeneral: 'AZUL',
      tieneSignos: true,
      badge: {
        text: 'CRÍTICO BAJO',
        color: '#0369a1',
        bg: '#e0f2fe',
        border: '#7dd3fc',
        dot: '#0284c7'
      },
      alertas: alertasAzules,
      chips
    };
  }

  // 4. Alerta Leve (Amarillo/Naranja)
  if (alertasLeves.length > 0) {
    return {
      estadoGeneral: 'AMARILLO',
      tieneSignos: true,
      badge: {
        text: 'ALERTA',
        color: '#92400e',
        bg: '#fef3c7',
        border: '#fcd34d',
        dot: '#d97706'
      },
      alertas: alertasLeves,
      chips
    };
  }

  // 5. Todos los signos vitales están en rango normal
  return {
    estadoGeneral: 'NORMAL',
    tieneSignos: true,
    badge: {
      text: 'NORMAL',
      color: '#166534',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      dot: '#16a34a'
    },
    alertas: [],
    chips
  };
}
