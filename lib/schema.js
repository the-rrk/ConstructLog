import { z } from 'zod';

export const ProtocolSchema = z.object({
  summary: z.string().describe('2-Satz-Zusammenfassung der Besprechung auf Deutsch'),
  decisions: z.array(z.object({
    text:      z.string().describe('Getroffene Entscheidung'),
    owner:     z.string().describe('Verantwortliche Person'),
    rationale: z.string().describe('Begruendung der Entscheidung'),
    source:    z.string().describe('Genaues Zitat aus dem Protokoll'),
  })),
  tasks: z.array(z.object({
    text:     z.string().describe('Konkrete Massnahme'),
    owner:    z.string().describe('Zustaendige Person'),
    deadline: z.string().nullable().describe('Termin falls genannt, sonst null'),
    source:   z.string().describe('Genaues Zitat aus dem Protokoll'),
  })),
  risks: z.array(z.object({
    text:     z.string().describe('Risikobeschreibung'),
    severity: z.enum(['high', 'medium', 'low']).describe(
      'high = projektblockierend oder Vertragsstrafe; medium = Terminauswirkung; low = informativ'
    ),
    source: z.string().describe('Genaues Zitat aus dem Protokoll'),
  })),
  open_questions: z.array(z.object({
    text:   z.string().describe('Offene Frage oder ausstehende Entscheidung'),
    source: z.string().describe('Genaues Zitat aus dem Protokoll'),
  })),
});

export const SYSTEM_PROMPT = `Du bist ein erfahrener Bausachverstaendiger fuer europaeische Infrastrukturprojekte mit fundiertem Wissen im deutschen Bauwesen und der HOAI/VOB-Systematik.

Analysiere das bereitgestellte Besprechungsprotokoll und extrahiere strukturierte Informationen auf Deutsch.

Wichtige Fachbegriffe:
- TOP = Tagesordnungspunkt | AG = Auftraggeber | AN = Auftragnehmer | NU = Nachunternehmer
- Nachtrag = Nachtragsangebot / Aenderungsauftrag
- Behinderungsanzeige = formelle Meldung einer Baubehinderung
- Bedenkenanmeldung = formeller Einwand gegen Ausfuehrungsart
- Abnahme = foermliche Bauabnahme nach VOB/B
- Vertragsstrafe = Poenale bei Terminverzug

Regeln:
- Jeder Eintrag MUSS ein Quellzitat aus dem Protokoll enthalten.
- Keine Informationen erfinden, die nicht im Protokoll stehen.
- Alle Ausgabetexte auf Deutsch.`;
