"""Reproduce the synthetic fixture; the application reads only the committed JSON."""
import json
from pathlib import Path

requirements = [
    ('wheelchair_entrance', 'Step-free entrance with automatic doors and a 36-inch clear opening.', 'The entrance has steps and no permanent ramp.'),
    ('accessible_parking', 'Two designated spaces with adjacent access aisles by the main entrance.', 'No designated accessible parking is available on site.'),
    ('elevators', 'An accessible elevator serves all patient floors.', 'There is no elevator; confirm whether your visit can be on the ground floor.'),
    ('adjustable_exam_table', 'A height-adjustable examination table lowers to 18 inches. Request it when booking.', 'Examination tables have a fixed height; no adjustable table is available.'),
    ('accessible_restroom', 'An accessible restroom has grab bars and wheelchair turning space.', 'Restrooms do not have sufficient wheelchair turning space.'),
    ('asl_interpretation', 'Video ASL interpretation can be reserved with two business days of notice.', 'ASL interpretation is not currently offered.'),
    ('written_communication', 'Staff can use a tablet or written notes throughout the visit.', 'A written-communication process is not available.'),
    ('visual_alerts', 'A visual appointment display and flashing emergency alerts are available.', 'The waiting area uses audio-only appointment announcements.'),
    ('screen_reader_forms', 'Digital intake forms have labeled controls and have been tested with screen readers in this fictional scenario.', 'Current intake forms are scanned documents without accessible fields.'),
    ('large_print', '18-point large-print intake and care materials are available on request.', 'Large-print versions of forms are not available.'),
    ('staff_assistance', 'Staff can assist with wayfinding and read forms aloud on request.', 'Dedicated wayfinding and reading assistance is not available.'),
    ('quiet_waiting', 'A separate quiet waiting room can be requested when booking.', 'There is one shared waiting room; a separate quiet space is not available.'),
    ('reduced_lighting', 'Dimmable lighting is available in designated examination rooms.', 'Examination room lighting cannot be dimmed.'),
    ('low_stimulation', 'A care room without background music or screens can be reserved.', 'Low-stimulation care spaces are not available.'),
    ('language_interpretation', 'Remote spoken-language interpretation is offered; request your language in advance.', 'Spoken-language interpretation is not available.'),
    ('alternative_communication', 'Staff allow extra time and support patient-provided AAC devices and communication boards.', 'There is no established AAC or communication-board support process.'),
]
# V = verified support, N = verified absence, R = self-reported support, ? = unknown.
rows = [
    ('willow-family-care', 'Willow Family Care', 'Primary care', 'teal', 'verified', 'Garden District', 'A welcoming neighborhood practice with flexible examination rooms and a dedicated patient support team.', 'VVVVVVVVVVVV?RVV'),
    ('cedar-grove-health', 'Cedar Grove Health', 'Primary care', 'blue', 'verified', 'Cedar Quarter', 'Whole-person primary care with spacious examination rooms and thoughtful mobility accommodations.', 'VVVVVNVRVVVNNNRV'),
    ('harborview-wellness', 'Harborview Wellness', 'Mental health', 'purple', 'verified', 'Waterfront', 'A small counseling practice designed around calm spaces, flexible communication, and unhurried visits.', 'VNNNVVV?VVVVVVVV'),
    ('northstar-rehabilitation', 'Northstar Rehabilitation', 'Physical therapy', 'peach', 'verified', 'North Commons', 'A rehabilitation studio with accessible equipment, wide treatment bays, and movement support.', 'VVVVV?VNVRVNNNVR'),
    ('fern-and-field-clinic', 'Fern & Field Clinic', 'Primary care', 'teal', 'self-reported', 'Garden District', 'A community-focused practice with a mix of documented and self-reported accommodation information.', 'VVRRV?VRRRV?RRVR'),
    ('juniper-dental-studio', 'Juniper Dental Studio', 'Dental care', 'blue', 'verified', 'Cedar Quarter', 'A dental practice offering written communication, extra appointment time, and adjustable lighting.', 'VVNNVNVNVVV?VVVN'),
    ('maple-hearing-center', 'Maple Hearing Center', 'Hearing & audiology', 'purple', 'verified', 'Midtown', 'An audiology practice with visual appointment cues, ASL interpretation, and multiple communication options.', 'VVV?VVVVVVVNNNVV'),
    ('lumen-eye-care', 'Lumen Eye Care', 'Vision care', 'peach', 'self-reported', 'Midtown', 'A vision-care studio sharing information about large-print materials and staff-assisted navigation.', 'VRV?V?R?VVVR?RV?'),
    ('meadow-pediatric-care', 'Meadow Pediatric Care', 'Pediatrics', 'teal', 'verified', 'North Commons', 'Family-focused care with quiet spaces and low-stimulation appointment options for children.', 'VVNVVVVVVVVVVVVV'),
    ('tidewell-specialty-care', 'Tidewell Specialty Care', 'Specialist care', 'blue', 'self-reported', 'Waterfront', 'A multispecialty practice with some documented mobility features and accommodation details still awaiting review.', 'VVV?V?VRR?V?R?R?'),
    ('clover-community-health', 'Clover Community Health', 'Primary care', 'purple', 'unverified', 'Old Town', 'A fictional community clinic whose submitted accommodation information has not yet been reviewed.', 'RR?RR?R?RRR???RR'),
    ('amber-brook-dental', 'Amber Brook Dental', 'Dental care', 'peach', 'unverified', 'Old Town', 'A demonstration dental office with limited accessibility information, illustrating why unknown details matter.', '?R?N??R?????R???'),
]
clinics = []
for i, (slug, name, specialty, color, verification, neighborhood, description, matrix) in enumerate(rows):
    assert len(matrix) == len(requirements), (name, len(matrix))
    accommodations = {}
    for (key, yes, no), code in zip(requirements, matrix):
        accommodations[key] = {
            'status': {'V': 'supported', 'N': 'unsupported', 'R': 'supported', '?': 'unknown'}[code],
            'verification': {'V': 'verified', 'N': 'verified', 'R': 'self-reported', '?': 'unverified'}[code],
            'detail': yes if code in 'VR' else no if code == 'N' else 'No reviewed information is available for this accommodation. Confirmation is needed.',
        }
    clinics.append({
        'id': slug, 'name': name, 'specialty': specialty, 'description': description,
        'address': f'{120 + i * 17} {neighborhood.split()[0]} Lane', 'city': 'Maple Harbor, NY 00000 (fictional)',
        'phone': f'(212) 555-{101+i:04d}', 'email': f'hello@{slug}.example',
        'hours': 'Monday–Friday, 8:30 AM–5:00 PM (demo)',
        'location': {'latitude': round(40.74 + i * .002, 4), 'longitude': round(-73.96 + i * .001, 4), 'neighborhood': neighborhood},
        'verification': verification, 'reviewedAt': '2026-10-28', 'accommodations': accommodations, 'color': color,
    })
Path(__file__).resolve().parents[1].joinpath('data/clinics.json').write_text(json.dumps(clinics, indent=2) + '\n')
print(f'Wrote {len(clinics)} synthetic facilities with {len(requirements)} accommodations each.')
