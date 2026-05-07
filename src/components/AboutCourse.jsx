import { motion } from 'framer-motion';
import RodolfoMoriImg from '../assets/rodolfo-mori.jpg';

const AboutCourse = ({ aboutData, homeButtons, basePath = '' }) => {
  // Default data if no aboutData is provided
  const defaultData = {
    courseTitle: 'Sobre o curso',
    courseDescription: `Criada por Rodolfo Mori, ex-eletricista que se tornou programador sênior em empresas como Santander, BTG Pactual, PI Investimentos e Toro Investimentos, a Formação DevClub Full Stack já ajudou mais de 15 mil alunos a saírem do zero e conquistarem seus primeiros empregos na programação, muitos faturando entre R$5 mil e R$20 mil por mês.

Com uma metodologia direta ao ponto, suporte 7 dias por semana, mentorias ao vivo e acompanhamento com recrutadora, o DevClub oferece tudo o que o mercado realmente exige para quem quer transformar a própria carreira, mesmo sem experiência, faculdade ou computador de última geração.`,
    additionalDescription: 'Aprenda estratégias avançadas de configuração de campanhas, segmentação de audiência, otimização de conversões e muito mais!',
    whatsappCardTitle: 'Entre no Grupo VIP do Whatsapp',
    whatsappCardDescription: 'Clique abaixo e entre no meu grupo exclusivo no Whatsapp para ter acesso aos avisos, atualizações e à condições exclusivas',
    materialsCardTitle: 'Materiais Exclusivos',
    materialsCardDescription: 'Apostilas, códigos e ferramentas práticas pra te ajudar a sair do zero, acelerar seu aprendizado e dar os primeiros passos.',
    instructorImage: RodolfoMoriImg,
    instructorName: 'Rodolfo Mori',
    instructorTitle: 'Programador Sênior',
    instructorBio: 'Rodolfo Mori, fundador do DevClub, já levou mais de 15 mil alunos do zero à programação. De eletricista a Dev Sênior em empresas como Santander e BTG, hoje ensina como conquistar os melhores empregos do mercado.'
  };

  // Merge default data with provided data
  const data = { ...defaultData, ...aboutData };

  // Default homeButtons if not provided
  const defaultHomeButtons = {
    whatsapp: { enabled: false, text: 'Entre no Grupo VIP do WhatsApp', url: '#' },
    secondary: { enabled: true, text: 'Materiais de Apoio', url: '/materiais' }
  };
  const buttons = { ...defaultHomeButtons, ...homeButtons };

  // Function to determine if a link is external
  const isExternalLink = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  // Function to format URLs correctly
  const formatUrl = (url, basePath = '') => {
    if (!url) return '#';
    if (isExternalLink(url)) {
      return url;
    } else {
      return url.startsWith('/') ? basePath + url : basePath + '/' + url;
    }
  };

  return (
    <section className="py-16 bg-netflix-dark">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-2/3">
            <motion.h2
              className="section-header mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {data.courseTitle}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                {data.courseDescription}
              </p>
              {data.additionalDescription && (
                <p className="text-gray-300 mb-4">
                  {data.additionalDescription}
                </p>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <motion.div
                className="bg-netflix-black p-4 rounded-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-2">{data.whatsappCardTitle}</h3>
                <p className="text-gray-400 mb-4">{data.whatsappCardDescription}</p>
                
                {buttons?.whatsapp?.enabled && (
                  <a
                    href={buttons.whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 text-sm rounded flex items-center w-max"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.3-.77.966-.944 1.164-.175.2-.349.223-.647.075-.3-.15-1.269-.465-2.411-1.485-.897-.8-1.502-1.788-1.674-2.085-.172-.3-.018-.465.13-.61.134-.133.3-.347.448-.522.15-.17.2-.3.3-.498.099-.2.05-.375-.025-.522-.075-.15-.672-1.621-.922-2.22-.24-.6-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.522.074-.797.375-.273.3-1.045 1.019-1.045 2.487 0 1.462 1.069 2.875 1.219 3.074.149.2 2.096 3.2 5.077 4.487.712.3 1.268.48 1.704.625.714.227 1.365.195 1.88.125.57-.075 1.758-.719 2.006-1.413.248-.693.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.658-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.412-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.1.547 4.149 1.588 5.951L0 24l6.304-1.654a11.882 11.882 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" fillRule="evenodd"/>
                    </svg>
                    {buttons.whatsapp.text || "Entre no Grupo VIP do WhatsApp"}
                  </a>
                )}
              </motion.div>
              
              <motion.div
                className="bg-netflix-black p-4 rounded-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-xl font-bold mb-2">{data.materialsCardTitle}</h3>
                <p className="text-gray-400 mb-4">{data.materialsCardDescription}</p>
                
                {buttons?.secondary?.enabled && (
                  <a
                    href={formatUrl(buttons.secondary.url, basePath)}
                    target={isExternalLink(buttons.secondary.url) ? "_blank" : "_self"}
                    rel={isExternalLink(buttons.secondary.url) ? "noopener noreferrer" : ""}
                    className="btn-primary py-2 px-4 text-sm inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {buttons.secondary.text || "Materiais de Apoio"}
                  </a>
                )}
              </motion.div>
            </div>
          </div>

          <motion.div
            className="md:w-1/3 bg-netflix-black rounded-md overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="h-80 overflow-hidden">
              <img
                src={data.instructorImage}
                alt={data.instructorName}
                className="w-full h-full object-cover object-top scale-[1.8] translate-y-8"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-1">{data.instructorName}</h3>
              <p className="text-gray-400 mb-3">{data.instructorTitle}</p>
              <p className="text-sm text-gray-300">
                {data.instructorBio}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutCourse;