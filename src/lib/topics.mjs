/**
 * Fonte única das seis áreas canônicas do acervo.
 * A ordem de inserção define a ordem dos grupos na sidebar e a allowlist
 * de `topic` no schema e no lint. Incluir uma área aqui a adiciona em todos
 * esses lugares de uma vez; nenhuma outra lista paralela deve existir.
 */
export const topicGroups = /** @type {const} */ ({
	'primeiros-passos': 'Primeiros passos',
	'licencas-e-downloads': 'Licenças e downloads',
	'dominio-e-publicacao': 'Domínio e publicação',
	'editar-seu-site': 'Editar seu site',
	'servicos-e-suporte': 'Serviços e suporte',
	'perguntas-frequentes': 'Perguntas frequentes',
});

export const topics = Object.keys(topicGroups);
