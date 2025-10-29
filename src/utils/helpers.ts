export const generateAdmissionNumber = (prefix: string) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}/${timestamp}${random}`;
};

// Example output: "PHD-POL2024/1A2B3C4D5E"


import type { DegreeClass, Programme, ProgrammeCategoryResponse, ProgrammeStatus, Tenant } from "@/types/programme";

export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};


/**
 * Generate a short, descriptive transaction reference
 * Example output: "PAY_20251018_4F7G"
 */
export const generateTransactionRef = (prefix = "TXN") => {
    // Current date in YYYYMMDD format
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}${mm}${dd}`;

    // Random 4-character alphanumeric string
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${prefix}_${dateStr}_${randomStr}`;
}


// Helper functions
export const getDegreeClassDisplay = (degreeClass?: DegreeClass): string => {
    if (!degreeClass) return 'Not specified';

    const displayMap: Record<DegreeClass, string> = {
        first_class: 'First Class',
        second_class_upper: 'Second Class Upper',
        second_class_lower: 'Second Class Lower',
        third_class: 'Third Class',
        pass: 'Pass'
    };
    return displayMap[degreeClass];
};

export const requiresNysc = (programme: Programme): boolean => {
    return programme.config.entry_requirements.requires_nysc === true;
};

export const getProgrammeLevel = (programme: Programme): string => {
    const code = programme.study_program_code?.toLowerCase();
    const name = programme.program_name?.toLowerCase();

    if (code?.includes('phd') || name?.includes('ph.d') || name?.includes('doctor')) {
        return 'Doctorate';
    } else if (code?.includes('msc') || code?.includes('m.sc') || name?.includes('master')) {
        return 'Masters';
    } else if (code?.includes('pgd') || name?.includes('postgraduate')) {
        return 'Postgraduate Diploma';
    } else if (code?.includes('bsc') || code?.includes('b.sc') || code?.includes('beng') || name?.includes('bachelor')) {
        return 'Undergraduate';
    } else {
        return 'Other';
    }
};

export const isPostgraduate = (programme: Programme): boolean => {
    const level = getProgrammeLevel(programme);
    return level === 'Masters' || level === 'Doctorate' || level === 'Postgraduate Diploma';
};

export const isUndergraduate = (programme: Programme): boolean => {
    return getProgrammeLevel(programme) === 'Undergraduate';
};

// New helper functions for the nested structure
export const getAllProgrammes = (categories: ProgrammeCategoryResponse[]): Programme[] => {
    return categories.flatMap(category =>
        category.programme_types.flatMap(type => type.study_programs)
    );
};

export const getProgrammesByCategory = (categories: ProgrammeCategoryResponse[], categoryName: string): Programme[] => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return [];

    return category.programme_types.flatMap(type => type.study_programs);
};

export const getProgrammesByType = (categories: ProgrammeCategoryResponse[], typeName: string): Programme[] => {
    const programmes: Programme[] = [];

    categories.forEach(category => {
        category.programme_types.forEach(type => {
            if (type.name === typeName) {
                programmes.push(...type.study_programs);
            }
        });
    });

    return programmes;
};

export const getProgrammesByTenant = (categories: ProgrammeCategoryResponse[], tenantId: number): Programme[] => {
    return getAllProgrammes(categories).filter(programme => programme.tenant_id === tenantId);
};

export const getUniqueTenants = (categories: ProgrammeCategoryResponse[]): Tenant[] => {
    const tenantsMap = new Map<number, Tenant>();

    getAllProgrammes(categories).forEach(programme => {
        if (!tenantsMap.has(programme.tenant.id)) {
            tenantsMap.set(programme.tenant.id, programme.tenant);
        }
    });

    return Array.from(tenantsMap.values());
};


/**
 * Extended Programme interface with category and programme type names
 */
export interface ProgrammeWithCategoryInfo extends Programme {
    category_name: string;
    programme_type_name: string;
    programme_category_id: number;
}

/**
 * Extracts all study programs with category and programme type names
 */
export function extractAllStudyPrograms(
    categories: ProgrammeCategoryResponse[]
): ProgrammeWithCategoryInfo[] {
    const allPrograms: ProgrammeWithCategoryInfo[] = [];

    categories?.forEach(category => {
        category?.programme_types?.forEach(programmeType => {
            programmeType?.study_programs?.forEach(program => {
                allPrograms.push({
                    ...program,
                    category_name: category.name,
                    programme_type_name: programmeType.name,
                    programme_category_id: category.id
                });
            });
        });
    });

    return allPrograms;
}

/**
 * Extracts study programs filtered by status with category info
 */
export function extractStudyProgramsByStatus(
    categories: ProgrammeCategoryResponse[],
    status: ProgrammeStatus
): ProgrammeWithCategoryInfo[] {
    const allPrograms = extractAllStudyPrograms(categories);
    return allPrograms.filter(program => program.status === status);
}

/**
 * Extracts study programs filtered by tenant with category info
 */
export function extractStudyProgramsByTenant(
    categories: ProgrammeCategoryResponse[],
    tenantId: number
): ProgrammeWithCategoryInfo[] {
    const allPrograms = extractAllStudyPrograms(categories);
    return allPrograms.filter(program => program.tenant_id === tenantId);
}

/**
 * Extracts study programs filtered by programme type with category info
 */
export function extractStudyProgramsByType(
    categories: ProgrammeCategoryResponse[],
    programmeTypeId: number
): ProgrammeWithCategoryInfo[] {
    const allPrograms: ProgrammeWithCategoryInfo[] = [];

    categories.forEach(category => {
        category.programme_types.forEach(programmeType => {
            if (programmeType.id === programmeTypeId) {
                programmeType.study_programs.forEach(program => {
                    allPrograms.push({
                        ...program,
                        category_name: category.name,
                        programme_type_name: programmeType.name,
                        programme_category_id: category.id
                    });
                });
            }
        });
    });

    return allPrograms;
}

/**
 * Extracts study programs filtered by category with category info
 */
export function extractStudyProgramsByCategory(
    categories: ProgrammeCategoryResponse[],
    categoryId: number
): ProgrammeWithCategoryInfo[] {
    const allPrograms: ProgrammeWithCategoryInfo[] = [];

    categories.forEach(category => {
        if (category.id === categoryId) {
            category.programme_types.forEach(programmeType => {
                programmeType.study_programs.forEach(program => {
                    allPrograms.push({
                        ...program,
                        category_name: category.name,
                        programme_type_name: programmeType.name,
                        programme_category_id: category.id
                    });
                });
            });
        }
    });

    return allPrograms;
}

/**
 * Extracts study programs with advanced filtering options including category info
 */
export function extractStudyProgramsWithFilters(
    categories: ProgrammeCategoryResponse[],
    filters: {
        status?: ProgrammeStatus;
        tenantId?: number;
        programmeTypeId?: number;
        categoryId?: number;
        minDuration?: number;
        maxDuration?: number;
        activeOnly?: boolean;
        searchTerm?: string;
    } = {}
): ProgrammeWithCategoryInfo[] {
    let programs = extractAllStudyPrograms(categories);

    if (filters.status) {
        programs = programs.filter(program => program.status === filters.status);
    }

    if (filters.tenantId) {
        programs = programs.filter(program => program.tenant_id === filters.tenantId);
    }

    if (filters.programmeTypeId) {
        programs = programs.filter(program =>
            program.programme_type_id === filters.programmeTypeId
        );
    }

    if (filters.categoryId) {
        programs = programs.filter(program =>
            program.programme_category_id === filters.categoryId
        );
    }

    if (filters.minDuration !== undefined) {
        programs = programs.filter(program => program.duration_months >= filters.minDuration!);
    }

    if (filters.maxDuration !== undefined) {
        programs = programs.filter(program => program.duration_months <= filters.maxDuration!);
    }

    if (filters.activeOnly) {
        programs = programs.filter(program => program.status === 'active');
    }

    if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        programs = programs.filter(program =>
            program.program_name.toLowerCase().includes(searchTerm) ||
            program.study_program_code.toLowerCase().includes(searchTerm) ||
            program.category_name.toLowerCase().includes(searchTerm) ||
            program.programme_type_name.toLowerCase().includes(searchTerm)
        );
    }

    return programs;
}

/**
 * Extracts unique tenants from all study programs
 */
export function extractUniqueTenants(categories: ProgrammeCategoryResponse[]): Tenant[] {
    const programs = extractAllStudyPrograms(categories);
    const tenantMap = new Map<number, Tenant>();

    programs.forEach(program => {
        if (!tenantMap.has(program.tenant_id)) {
            tenantMap.set(program.tenant_id, program.tenant);
        }
    });

    return Array.from(tenantMap.values());
}

/**
 * Gets all unique categories from the data
 */
export function extractUniqueCategories(categories: ProgrammeCategoryResponse[]): { id: number; name: string }[] {
    return categories.map(category => ({
        id: category.id,
        name: category.name
    }));
}

/**
 * Gets all unique programme types from the data
 */
export function extractUniqueProgrammeTypes(categories: ProgrammeCategoryResponse[]): { id: number; name: string; category_id: number }[] {
    const programmeTypes: { id: number; name: string; category_id: number }[] = [];

    categories.forEach(category => {
        category.programme_types.forEach(programmeType => {
            programmeTypes.push({
                id: programmeType.id,
                name: programmeType.name,
                category_id: category.id
            });
        });
    });

    return programmeTypes;
}


interface FormField {
    type: string;
    name: string;
    required: boolean;
    placeholder: string;
    label: string;
    options?: Array<{ value: string; label: string }>;
}

interface FormSection {
    title: string;
    description: string;
    formFields: FormField[];
    multiple?: boolean;
    optional?: boolean;
}

interface FormTemplate {
    admission_form: FormSection[];
}

interface FlatFormData {
    [key: string]: any;
}

export interface RegroupedFormData {
    [sectionTitle: string]: {
        [fieldName: string]: any | any[];
    };
}

export const regroupFormData = (flatData: FlatFormData, formTemplate: FormTemplate): RegroupedFormData => {
    const regrouped: RegroupedFormData = {};

    formTemplate.admission_form.forEach((section, sectionIndex) => {
        const sectionTitle = section.title.toLocaleLowerCase().replaceAll(" ", "_");

        regrouped[sectionTitle] = {};

        if (section.multiple) {
            // Handle multiple entries (like Employment History, Prizes/Awards, etc.)
            const multipleEntries: { [key: string]: any }[] = [];
            let entryIndex = 0;

            // Find all entries for this section
            while (true) {
                const entryData: { [key: string]: any } = {};
                let hasData = false;

                section.formFields.forEach(field => {
                    const key = `${sectionIndex}_${entryIndex}_${field.name}`;
                    if (flatData[key] !== undefined && flatData[key] !== '') {
                        entryData[field.name] = flatData[key];
                        hasData = true;
                    }
                });

                if (!hasData) break;

                multipleEntries.push(entryData);
                entryIndex++;
            }

            // If we have multiple entries, store as array, otherwise as single object
            if (multipleEntries.length > 0) {
                regrouped[sectionTitle] = multipleEntries;
            } else {
                // For sections with no data, check if we have single entry data (like your example)
                const singleEntryData: { [key: string]: any } = {};
                section.formFields.forEach(field => {
                    const key = `${sectionIndex}_0_${field.name}`;
                    if (flatData[key] !== undefined) {
                        singleEntryData[field.name] = flatData[key];
                    }
                });

                if (Object.keys(singleEntryData).length > 0) {
                    regrouped[sectionTitle] = [singleEntryData];
                }
            }
        } else {
            // Handle single entry sections
            const sectionData: { [key: string]: any } = {};

            section.formFields.forEach(field => {
                const key = `${sectionIndex}_0_${field.name}`;
                if (flatData[key] !== undefined) {
                    sectionData[field.name] = flatData[key];
                }
            });

            regrouped[sectionTitle] = sectionData;
        }
    });


    return regrouped;
};