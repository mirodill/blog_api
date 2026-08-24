import Experience from '../models/experience.model.js';

const requiredFields = ['organization', 'position', 'description', 'work_type', 'location'];
const parseList = (value) => Array.isArray(value) ? value.filter(Boolean) : typeof value === 'string' ? value.split('\n').map((item) => item.trim()).filter(Boolean) : [];

const buildDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return '';
  const start = new Date(startDate);
  const end = isCurrent || !endDate ? new Date() : new Date(endDate);
  const months = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return [years ? `${years} yr${years > 1 ? 's' : ''}` : '', remainingMonths ? `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ') || 'Less than a month';
};

export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.getAll();
    res.json({ success: true, count: experiences.length, data: experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExperience = async (req, res) => {
  try {
    const missing = requiredFields.some((field) => !req.body[field]?.trim()) || !req.body.start_date || (!req.body.is_current && !req.body.end_date) || !parseList(req.body.responsibilities).length || !parseList(req.body.technologies).length;
    if (missing) return res.status(400).json({ success: false, message: 'Barcha tajriba maydonlarini to‘ldiring' });
    const experience = await Experience.create({ ...req.body, organization_url: req.body.organization_url?.trim() || null, duration: buildDuration(req.body.start_date, req.body.end_date, req.body.is_current), responsibilities: parseList(req.body.responsibilities), technologies: parseList(req.body.technologies) });
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const current = await Experience.getById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Tajriba topilmadi' });
    const data = Object.fromEntries(requiredFields.map((field) => [field, req.body[field]?.trim() || current[field]]));
    data.start_date = req.body.start_date || current.start_date;
    data.end_date = req.body.is_current ? null : (req.body.end_date || current.end_date);
    data.is_current = req.body.is_current === undefined ? current.is_current : req.body.is_current === true;
    data.duration = buildDuration(data.start_date, data.end_date, data.is_current);
    data.location = req.body.location ?? current.location;
    data.organization_url = req.body.organization_url === undefined ? current.organization_url : req.body.organization_url.trim() || null;
    data.responsibilities = req.body.responsibilities === undefined ? current.responsibilities : parseList(req.body.responsibilities);
    data.technologies = req.body.technologies === undefined ? current.technologies : parseList(req.body.technologies);
    const experience = await Experience.update(req.params.id, data);
    res.json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const deleted = await Experience.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Tajriba topilmadi' });
    res.json({ success: true, message: 'Tajriba o‘chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
